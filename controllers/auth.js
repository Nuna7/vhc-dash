import { body, validationResult, matchedData } from "express-validator";

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
			const user = await User.exists({ username: value });
			
			if (!user) return Promise.reject("User does not exist");
			if (!user.approved) return Promise.reject("User not approved");
			
			return true;
		}

		catch(err) { next(err); }
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
	const returnTo = req.session.returnTo;
	delete req.session.returnTo;

	(req.session.flash ??= {}).message = { 
		msg: `Logged in as "${req.user.username}" successfully.` 
	}

	res.redirect(returnTo || "/");
}

// login failure POST ----------------------------------------------------------
export function login_error_post(err, req, res, next) {
	(req.session.flash ??= {}).errors = {
		for: "login",
		err: [{ 
			path: "password", 
			msg: "Incorrect passkey" 
		}]
	};

	return res.redirect("/login");
}

// logout ----------------------------------------------------------------------
export function logout(req, res, next) {
	req.logout();

	(req.session.flash ??= {}).message = {
		msg: "Terminated user session successfully."
	}
	
	res.redirect(req.query.next);
}

// REGISTRATION ================================================================

export function register_get(req, res, next) {
	if (req.query.next) req.session.returnTo = req.query.next;
	res.render("auth/register", { title: "Register" });

}

// registration request --------------------------------------------------------
export const register_post = [
	body("username", "Invalid username length").trim().isLength({ min: 3, max: 20 }).custom(async value => {
		try { return (await User.exists({ username: value })) ? Promise.reject("Username not unique") : true; }
		catch(err) { next(err); }
	}),

	body("email", "Invalid email ID").trim().isEmail().custom(async value => {
		try { return (await User.exists({ email: value })) ? Promise.reject("User with this email ID exists") : true; }
		catch(err) { next(err); }
	}),

	body("orcid").custom(async value => {
		try {
			if (await User.exists({ orcid: value })) throw new Error("User with this ORCiD exists");

			// test orcid pattern against regex
			const orcidPattern = /^(\d{4}-){3}\d{3}[\dX]$/;
			if (!orcidPattern.test(value)) throw new Error("Invalid ORCiD format");

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

			if (providedCD !== expectedCD) throw new Error("Invalid ORCiD check digit");

			return true;
		}

		catch(err) { next(err); }
	}),

	body("phone", "Invalid phone number").optional({checkFalsy: true}).trim().isMobilePhone(),

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

		const data = matchedData(req);

		User.register({ 
			username: data.username,
			email: data.email,
			orcid: data.orcid,
			phone: data.phone,
			creationComment: data.comments
		}, req.body.password);
		
		(req.session.flash ??= {}).message = {
			msg: "Registration request successful. Contact POC for approval status." 
		}
		
		res.redirect("/");
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
	logout
};