const { body, check, validationResult } = require("express-validator");

const User = require("../models/User");

exports.panel = (req, res, next) => {
	res.render("panel", { title: "User Panel" });
}

exports.edit_user = [
	body("email", "Invalid email address").isEmail(),

	body("orcid").custom((value, { req }) => {
		if (!value) { return true; }
		
		if (req.user.orcid) {
			throw new Error("ORCiD already set");
		}

		// test orcid pattern against regex
        const orcidPattern = /^(\d{4}-){3}\d{3}[\dX]$/;
        
		if (!orcidPattern.test(value)) {
          throw new Error("Invalid ORCiD format");
        }

        const baseDigits = value.replace(/-/g, "").substring(0, 15);
        const providedCheckDigit = value.charAt(value.length - 1);

		// calculate ORCiD check digit
		let total = 0;

		for (let i = 0; i < baseDigits.length; i++) {
			const digit = parseInt(baseDigits.charAt(i), 10);
			total = (total + digit) * 2;
		}
		
		const remainder = total % 11;
		const result = (12 - remainder) % 11;
		const expectedCheckDigit = result === 10 ? 'X' : result.toString();

        if (providedCheckDigit !== expectedCheckDigit) {
          throw new Error("Invalid ORCiD check digit");
        }

        return true;
	}),

	body("phone", "Invalid phone number").optional({checkFalsy: true}).isMobilePhone(),
	
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