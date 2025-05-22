import { Schema, model } from "mongoose";

import User from "./User.js";

// implicit ballot model definition
const BallotSchema = new Schema({
	voter: { type: Schema.Types.ObjectId, ref: "User", required: true },
	ranking: { type: [Schema.Types.ObjectId], required: true },
	failCount: { type: Number, required: true }
}, { timestamps: true });

const RCVSchema = new Schema({
	ballots: { type: [BallotSchema] }
}, { timestamps: true });

export default model("RCV", RCVSchema);