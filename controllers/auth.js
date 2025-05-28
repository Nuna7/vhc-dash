import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { body, validationResult, matchedData } from "express-validator";

import { encrypt, decrypt } from "../helpers/cryptography.js";
import { flashAndRedirect } from "../helpers/flash.js";

import User from "../models/User.js";

// LOGIN/OUT ===================================================================

// login page
export function login_get(req, res, next) {
	if (req.query.next) req.session.returnTo = req.query.next;
	res.render("auth/login", { title: "Log In" });
}

// pre-validation POST ---------------------------------------------------------
export const login_validate_post = [
	body("username").trim().custom(async value => {
		try {
			const user = await User.findOne({ username: value })
				.select("approved")
				.lean()
				.exec();

			if (!user) return Promise.reject("User does not exist");
			if (!user.approved) return Promise.reject("User not approved");

			return true;
		}

		catch (err) { throw new Error("Database error"); }
	}),

	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			(req.session.flash ??= {}).errors = {
				for: "login",
				err: errors.array()
			}

			return res.redirect("/login");
		}

		next();
	}
]

// login success POST ----------------------------------------------------------
export function login_success_post(req, res, next) {
	if (req.user.totpEnabled) {
		req.session.pending2FAVerificationID = req.user._id;

		req.logout();

		return flashAndRedirect(req, res, "message", {
			msg: "Login partially complete - finish two-factor authentication."
		}, "/2fa")
	}

	const returnTo = req.session.returnTo;
	delete req.session.returnTo;

	flashAndRedirect(req, res, "message", {
		msg: `Logged in as "${req.user.username}" successfully.`
	}, "/")
}

// login failure POST ----------------------------------------------------------
export function login_error_post(err, req, res, next) {
	flashAndRedirect(req, res, "errors", {
		for: "login",
		err: [{
			path: "password",
			msg: "Incorrect passkey"
		}]
	}, "/login");
}

// logout ----------------------------------------------------------------------
export function logout(req, res, next) {
	req.logout();

	flashAndRedirect(req, res, "message", {
		msg: "Terminated user session successfully."
	}, req.query.next)
}

// 2FA =========================================================================

export async function twofa_verify_get(req, res, next) {
	if (!req.session.pending2FAVerificationID) return res.redirect("/login");

	res.render("auth/2fa-verify", {
		title: "Log In - 2FA"
	});
}

// 2FA verification ------------------------------------------------------------
export async function twofa_verify_post(req, res, next) {
	const { token } = req.body;

	// safety check
	if (!req.session.pending2FAVerificationID) {
		return flashAndRedirect(req, res, "message", {
			type: "error",
			msg: "Your session has expired. Please log in again."
		}, "/login");
	}

	try {
		const user = await User.findById(req.session.pending2FAVerificationID);

		if (!user || !user.totpEnabled || !user.totpSecret) {
			throw new Error("Invalid 2FA user state.");
		}
		
		const isVerified = speakeasy.totp.verify({
			secret: decrypt(user.totpSecret),
			encoding: "base32",
			token,
			window: 1
		});

		if (!isVerified) {
			return flashAndRedirect(req, res, "message", {
				type: "error",
				msg: "Invalid code. Please try again."
			}, "/2fa");
		}

		// fully log the user in
		req.login(user, function (err) {
			if (err) { return next(err); }

			delete req.session.pending2FAVerificationID;
			const returnTo = req.session.returnTo;
			delete req.session.returnTo;

			flashAndRedirect(req, res, "message", {
				msg: `Logged in as "${req.user.username}" successfully.`
			}, returnTo || "/")
		});
	}

	catch (err) { return next(err); }
}

// REGISTRATION ================================================================

export async function register_get(req, res, next) {
	const secret = speakeasy.generateSecret({ name: "VHC" });

	const qr = await QRCode.toDataURL(secret.otpauth_url, {
		margin: 0,
		scale: 10,
		color: {
			dark: "#000000",
			light: "#00000000"
		}
	});

	if (req.query.next) req.session.returnTo = req.query.next;

	res.render("auth/register", {
		title: "Register",
		qr: qr,
		secret: secret.base32
	});
}

// registration request --------------------------------------------------------
export const register_post = [
	body("username", "Invalid username length").trim().isLength({ min: 3, max: 20 }).custom(async value => {
		try { return (await User.exists({ username: value })) ? Promise.reject("Username not unique") : true; }
		catch (err) { throw new Error("Database error"); }
	}),

	body("email", "Invalid email ID").trim().isEmail().custom(async value => {
		try { return (await User.exists({ email: value })) ? Promise.reject("User with this email ID exists") : true; }
		catch (err) { throw new Error("Database error"); }
	}),

	body("orcid").custom(async value => {
		try {
			if (await User.exists({ orcid: value })) return Promise.reject("User with this ORCiD exists");

			// test orcid pattern against regex
			const orcidPattern = /^(\d{4}-){3}\d{3}[\dX]$/;
			if (!orcidPattern.test(value)) return Promise.reject("Invalid ORCiD format");

			// validate ORCiD check digit
			const baseDigits = value.replace(/-/g, "").substring(0, 15);
			const providedCD = value.charAt(value.length - 1);

			let total = 0;

			for (let i = 0; i < baseDigits.length; i++) {
				const digit = parseInt(baseDigits.charAt(i), 10);
				total = (total + digit) * 2;
			}

			const remainder = total % 11;
			const result = (12 - remainder) % 11;
			const expectedCD = result === 10 ? 'X' : result.toString();

			if (providedCD !== expectedCD) return Promise.reject("Invalid ORCiD check digit");

			return true;
		}

		catch (err) { throw new Error("Database error"); }
	}),

	body("phone", "Invalid phone number").optional({ checkFalsy: true }).trim().isMobilePhone(),

	body("password", "Invalid password length").isLength({ min: 8 }),

	body("confirm", "Password confirmation does not match").custom((value, { req }) => {
		return value == req.body.password || Promise.reject();
	}),

	body("comments").trim().escape().isLength({ max: 300 }),

	async (req, res, next) => {
		delete req.session.returnTo;

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			(req.session.flash ??= {}).errors = {
				for: "register",
				err: errors.array()
			}

			return res.redirect("/register");
		}

		const token = req.body.token;
		const secret = req.body.secret

		const isVerified = speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token,
			window: 1 // allow slight time drift
		});

		if (!isVerified) {
			return flashAndRedirect(req, res, "message", {
				type: "error",
				msg: "Invalid 6-digit code. Please try again."
			}, "/register");
		}

		const data = matchedData(req);

		try {
			await User.register({
				creationComment: data.comments,
				username: data.username,
				email: data.email,
				orcid: data.orcid,
				phone: data.phone,
				totpSecret: encrypt(secret),
				totpEnabled: true
			}, req.body.password);

			flashAndRedirect(req, res, "message", {
				msg: "Registration request successful. Contact POC for approval status."
			}, "/")
		}

		catch (err) { next(err); }
	}
]

// DEFAULT EXPORT ==============================================================

export default {
	login_get,
	login_validate_post,
	login_success_post,
	login_error_post,
	register_get,
	register_post,
	twofa_verify_get,
	twofa_verify_post,
	logout
};