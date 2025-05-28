import { body, validationResult, matchedData } from "express-validator";
import createError from "http-errors";

import { flashAndRedirect } from "../helpers/flash.js";

import User from "../models/User.js";

// USER INFO PANEL =============================================================

export function panel(req, res, next) {
	res.render("user", { title: "User Panel" });
}

// edit user details -----------------------------------------------------------
export const edit_user = [
	body("email", "Invalid email ID").trim().isEmail().custom(async (value, { req }) => {
		try {
			return (await User.exists({ _id: { $ne: req.user._id }, email: value }))
				? Promise.reject("User with that email ID exists")
				: true;
		}

		catch (err) { throw new Error("Database error"); }
	}),

	body("phone", "Invalid phone number").optional({ checkFalsy: true }).trim().isMobilePhone(),

	async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			(req.session.flash ??= {}).errors = {
				for: "info",
				err: errors.array()
			}

			return res.redirect("/user");
		}

		const data = matchedData(req);

		// check for mismatch in expected and request user
		if (req.body.uid != req.user._id.toString()) {
			const err = createError(
				403,
				"Attempting to edit another user's information - re-check authentication status."
			)
			err.returnURL = "/user";
			
			return next(err);
		}

		try {
			await User.findById(req.user._id).updateOne({
				email: data.email,
				phone: data.phone
			});

			flashAndRedirect(req, res, "message", {
				msg: `Updated info. for "${req.user.username}" successfully.`
			}, "/user")
		}

		catch (err) { next(err); }
	}
]

// update password -------------------------------------------------------------
export const edit_password = [
	body("old", "Incorrect former passkey").custom(async (value, { req }) => {
		try { return (await req.user.authenticate(value)).error ? Promise.reject() : true; }
		catch (err) { throw new Error("Database error"); }
	}),

	body("new", "Invalid passkey length").isLength({ min: 8 }),

	body("confirm", "Passkey confirmation does not match").custom((value, { req }) => {
		return value == req.body.new || Promise.reject();
	}),

	async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			(req.session.flash ??= {}).errors = {
				for: "password",
				err: errors.array()
			}

			return res.redirect("/user#PasswordForm");
		}

		const data = matchedData(req);

		// check for mismatch in expected and request user
		if (req.body.uid != req.user._id.toString()) {
			const err = createError(
				403,
				"Attempting to change another user's password - re-check authentication status."
			);
			err.returnURL = "/user";
			
			return next(err);
		}

		try {
			await req.user.changePassword(data.old, data.new);

			flashAndRedirect(req, res, "message", {
				msg: `Updated passkey for ${req.user.username} successfully.`
			}, "/user")
		}

		catch (err) { next(err); }
	}
]

// DEFAULT EXPORT ==============================================================

export default {
	panel,
	edit_user,
	edit_password
}