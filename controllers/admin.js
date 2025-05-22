import { body, validationResult } from "express-validator";

import User from "../models/User.js";

// DEPOT =======================================================================

export async function depot_get(req, res, next) {
	try {
		res.render("admin/depot", { 
			title: "Registration Depot",
			users: await User.find({ approved: false })
		});
	}

	catch(err) { next(err); }
}

// process registration requests -----------------------------------------------
export const depot_post = [
	body().custom(body => {
		// validate roles against regex
		for (const key of Object.keys(body).filter(key => key.startsWith("roles-"))) {
			const pattern = /^((?!-)(?!.*--)[a-z0-9-]+(?<!-)(,\s*(?!-)(?!.*--)[a-z0-9-]+(?<!-))*)?$/;
			if (!pattern.test(body[key])) throw new Error("Invalid role(s) format");
		}

		return true;
	}),

	async (req, res, next) => {
		const errors = validationResult(req);
		
		if (!errors.isEmpty()) { 
			(req.session.flash ??= {}).errors = {
				for: "depot",
				err: errors.array()
			}
			
			return res.redirect("/admin/user-depot");
		}

		// get all status field keys that are not "defer"
		const statusKeys = Object.keys(req.body)
			.filter((key) => key.startsWith("status-"))
			.filter((key) => req.body[key] != "defer");

		// extract user IDs
		const userIDs = statusKeys.map((key) => key.replace("status-", ""));

		for (const id of userIDs) {
			const status = req.body[`status-${id}`];
			const roles = (req.body[`roles-${id}`] || "")
							.split(",")
							.map((role) => role.trim())
							.filter(Boolean);  

			try {
				// delete user upon rejection
				if (status == "reject") await User.findByIdAndDelete(id);
				
				// approve user and and set roles
				else {
					await User.findByIdAndUpdate(id, {
						$set: { 
							approved: (status == "approve") ,
							roles: roles
						}
					});
				}
			}

			catch(err) { next(err); }
		}

		(req.session.flash ??= {}).message = {
			msg: `Successfully processed ${userIDs.length} registration request(s).` 
		}

		return res.redirect("/admin/user-depot");
	}
]

// DEFAULT EXPORT ==============================================================

export default {
	depot_get,
	depot_post
};