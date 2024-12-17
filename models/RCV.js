const mongoose = require("mongoose");

const User = require("./User");

const Schema = mongoose.Schema;

// implicit ballot model definition
const BallotSchema = new Schema({
	voter: { type: Schema.Types.ObjectId, ref: "User", required: true },
	ranking: { type: [Schema.Types.ObjectId], required: true },
	fail_count: { type: Number, required: true }
}, { timestamps: { createdAt: "cast", updatedAt: "updated" } });

const RCVSchema = new Schema({
	ballots: { type: [BallotSchema] }
}, { timestamps: { createdAt: "created", updatedAt: "edited" } });

module.exports = mongoose.model("RCV", RCVSchema);