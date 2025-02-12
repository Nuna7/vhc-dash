const { body, check, validationResult } = require("express-validator");

const User = require("../models/User");

exports.panel = (req, res, next) => {
	res.render("panel", { title: "User Panel" });
}

exports.edit_user = [
	body("email", "Invalid email ID").trim().isEmail().custom(value => {
		return User.findOne({ email: value }).then(result => { 
			return result ? Promise.reject("User with this email ID exists") : true;
		});
	}),

	body("orcid").custom((value) => {
		if (!value) return true;

		// disallow setting ORCiD once already set
		if (req.user.orcid) throw new Error("ORCiD already set");

		return User.findOne({ orcid: value }).then(user => { 
			if (user) throw new Error("User with this ORCiD exists");
	
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
		});
	}),

	body("phone", "Invalid phone number").optional({checkFalsy: true}).trim().isMobilePhone(),
	
	(req, res, next) => {
		const errors = validationResult(req);
		
		if (!errors.isEmpty()) { 
			req.session.errors = errors.array();
			return res.redirect("/user/panel");
		}
		
		User.findById(req.user._id).updateOne({
			email: req.body.email,
			orcid: req.body.orcid,
			phone: req.body.phone
		}).then(() => { res.redirect("/user/panel"); });
	}
]