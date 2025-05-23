import { body, validationResult, matchedData } from "express-validator";

import { flashAndRedirect } from "../utils/flash.js";

import User from "../models/User.js";

export function panel(req, res, next) {
	res.render("user", { title: "User Panel" });
}


export const edit_user = [
	body("email", "Invalid email ID").trim().isEmail().custom(async (value, { req }) => {
		try { return (await User.exists({ _id: { $ne: req.user._id }, email: value })) ? Promise.reject("User with this email ID exists") : true; }
		catch (err) { next(err); }
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

export const edit_password = [
	body("old", "Incorrect former passkey").custom(async (value, { req }) => {
		try { return (await req.user.authenticate(value)).error ? Promise.reject() : true; }
		catch (err) { next(err); }
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

		try {
			await req.user.changePassword(data.old, data.new);

			flashAndRedirect(req, res, "message", {
				msg: `Updated passkey for ${req.user.username} successfully.`
			}, "/user")
		}

		catch (err) { next(err); }
	}
]

export default {
	panel,
	edit_user,
	edit_password
}