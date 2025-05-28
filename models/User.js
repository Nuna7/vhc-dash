import { Schema, model } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

import RCV from "./RCV.js";

// SCHEMAS =====================================================================

const UserSchema = new Schema({
	approved: { type: Boolean, default: false }, // only approved users can log in
	creationComment: { type: String }, // comment submitted at registration
	roles: [{ type: String, enum: ["admin", "researcher"] }],
	email: { type: String, required: true, unique: true },
	orcid: { type: String, required: true, unique: true },
	phone: { type: String },
	totpSecret: {
		iv: String,
		content: String,
		tag: String
	},
	totpEnabled: { type: Boolean, default: false }
}, { timestamps: true });

// sanitize empty ORCiD values
UserSchema.pre("save", function (next) {
	if (this.orcid === "") this.orcid = undefined;
	next();
});

// deletion cascade
UserSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
	// delete all RCV ballots cast by user 
	await RCV.updateMany(
		{ "ballots.voter": this._id },
		{ $pull: { ballots: { voter: this._id } } }
	); next();
});

UserSchema.plugin(passportLocalMongoose, {
	// filter query by approved users
	findByUsername: function (model, queryParameters) {
		queryParameters.approved = true;
		return model.findOne(queryParameters);
	}
});

// DEFAULT EXPORT ==============================================================

export default model("User", UserSchema);