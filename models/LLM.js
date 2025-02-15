const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LLMSchema = new Schema({
	name: { type: String, required: true },
	version: { type: Schema.Types.Decimal128 },
	parameters: { type: Schema.Types.Decimal128 },
}, { timestamps: { createdAt: "created", updatedAt: "edited" } });

// concatenate model data into display information
LLMSchema.virtual("displayName").get(function() {
	var display = this.name;

	if (this.parameters) display += `-${this.parameters}b`;
	if (this.version) display += `-v${this.version}`;

	return display;
});

module.exports = mongoose.model("LLM", LLMSchema);