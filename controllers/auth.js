const { body, check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const User = require("../models/User");

exports.login_get = (req, res, next) => {
	if (req.query.next) { req.session.returnTo = req.query.next }
	res.render("auth/login", { title: "Log In" });
}

exports.login_validate_post = [
	body("username").custom((value) => {
		return User.findOne({ username: value }).then(user => {
			if (!user) { return Promise.reject("User does not exist"); }
			if (!user.approved) { return Promise.reject("User not approved"); }
			
			return true;
		});
		
	}),
	
	(req, res, next) => {
		const errors = validationResult(req);
		console.log(errors);
		
		if (!errors.isEmpty()) { 
			req.session.errors = errors.array();
			return res.redirect("/login");
		} 

		next();
	}
]

exports.login_success_post = (req, res, next) => {
	const returnTo = req.session.returnTo;
	req.session.returnTo = undefined;
	res.redirect(returnTo || "/");
}

exports.login_error_post = (err, req, res, next) => {
	req.session.errors = [{ 
		path: "password", 
		msg: "Incorrect passkey" 
	}];

	return res.redirect("/login");
}

exports.logout = (req, res, next) => {
	req.logout();
	res.redirect(req.query.next);
}