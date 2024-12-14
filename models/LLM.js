const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LLMSchema = new Schema({
	name: { type: String, required: true },
	version: { type: String },
	parameters: { type: Schema.Types.Decimal128, required: true },
}, { timestamps: { createdAt: "created", updatedAt: "edited" } });

// concatenate model data into display information
LLMSchema.virtual("displayName").get(function() {
	return `${this.name}-${this.parameters}b${this.version ? "-v" + String(this.version) : ""}`;
});

module.exports = mongoose.model("LLM", LLMSchema);