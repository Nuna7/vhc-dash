const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const RCV = require("./RCV");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	roles: { type: Array },
	email: { type: String, required: true, unique: true },
	orcid: { type: String, unique: true },
	phone: { type: String }
}, { timestamps: { createdAt: "created", updatedAt: "updated" } });

// deletion cascade
UserSchema.pre("deleteOne", { document: true, query: false }, async function(next) { 
	// delete all RCV ballots cast by user 
	await RCV.updateMany(
		{ "ballots.voter": this._id },
		{ $pull: { ballots: { voter: this._id } } }
	); next();
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);