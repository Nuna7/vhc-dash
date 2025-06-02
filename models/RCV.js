import { Schema, model } from "mongoose";

import User from "./User.js";

// SCHEMAS =====================================================================

// implicit ballot schema
const BallotSchema = new Schema({
	voter: { type: Schema.Types.ObjectId, ref: "User", required: true },
	ranking: { 
		type: [Schema.Types.ObjectId], 
		required: true,
		validate: {
			// check if array elements are unique
			validator: (arr) => Array.isArray(arr) && new Set(arr.map(String)).size === arr.length,
			message: "Ranking must contain unique choices"
		}
	},
	failCount: { type: Number, required: true },
	rationale: { type: String, required: true }
}, { timestamps: true });

// main paraphrase voting schema -----------------------------------------------
const RCVSchema = new Schema({
	ballots: { type: [BallotSchema] }
}, { timestamps: true });

// DEFAULT EXPORT ==============================================================

export default model("RCV", RCVSchema);