import { body, validationResult } from "express-validator";

import User from "../models/User.js";

export function panel(req, res, next) {
	res.render("user", { title: "User Panel" });
}


export const edit_user = [
	body("email", "Invalid email ID").trim().isEmail().custom(async (value, { req }) => {
		return (await User.findOne({ _id: { $ne: req.user._id }, email: value })) ? Promise.reject("User with this email ID exists") : true;
	}),

	body("phone", "Invalid phone number").optional({checkFalsy: true}).trim().isMobilePhone(),
		
	async (req, res, next) => {
		const errors = validationResult(req);
		
		if (!errors.isEmpty()) { 
			(req.session.flash ??= {}).errors = {
				for: "info",
				err: errors.array()
			}

			return res.redirect("/user");
		}
		
		await User.findById(req.user._id).updateOne({
			email: req.body.email,
			phone: req.body.phone
		});

		(req.session.flash ??= {}).message = { 
			msg: `Updated info. for "${req.user.username}" successfully.` 
		};
		
		res.redirect("/user");
	}
]

export const edit_password = [
	body("old", "Incorrect former passkey").custom(async (value, { req }) => {
		return (await req.user.authenticate(value)).error ? Promise.reject() : true;
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

		await req.user.changePassword(req.body.old, req.body.new);
		
		(req.session.flash ??= {}).message = {
			msg: `Updated passkey for ${req.user.username} successfully.` 
		}
		
		res.redirect("/user"); 
	}
]

export default {
	panel,
	edit_user,
	edit_password
}