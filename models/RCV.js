const mongoose = require("mongoose");

const { Schema } = mongoose;

const User = require("./User");

// implicit ballot model definition
const BallotSchema = new Schema({
	voter: { type: Schema.Types.ObjectId, ref: "User", required: true },
	ranking: { type: [Schema.Types.ObjectId], required: true },
	failCount: { type: Number, required: true }
}, { timestamps: true });

const RCVSchema = new Schema({
	ballots: { type: [BallotSchema] }
}, { timestamps: true });

module.exports = mongoose.model("RCV", RCVSchema);