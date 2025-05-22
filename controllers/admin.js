import { body, validationResult } from "express-validator";

import User from "../models/User.js";


export async function depot_get(req, res, next) {
	res.render("admin/depot", { 
		title: "Registration Depot",
		users: await User.find({ approved: false })
	});
}


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

		// map status keys to role keys and extract user IDs
		const roleKeys = statusKeys.map((key) => key.replace("status", "roles"));
		const userIDs= statusKeys.map((key) => key.replace("status-", ""));

		for (const id of userIDs) {
			const status = req.body[statusKeys.filter((key) => key.endsWith(id))[0]];
			const roles = (req.body[roleKeys.find((key) => key.endsWith(id))] || "")
							.split(",")
							.map((role) => role.trim())
							.filter(Boolean);  

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

		(req.session.flash ??= {}).message = {
			msg: `Successfully processed ${userIDs.length} registration request(s).` 
		}

		return res.redirect("/admin/user-depot");
	}
]

export default {
	depot_get,
	depot_post
};