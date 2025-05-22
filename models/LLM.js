import { Schema, model } from "mongoose";

// SCHEMAS =====================================================================

const LLMSchema = new Schema({
	name: { type: String, required: true },
	version: { type: Schema.Types.Decimal128 },
	parameters: { type: Schema.Types.Decimal128 },
});

// concatenate model data into display information
LLMSchema.virtual("displayName").get(function() {
	var display = this.name;

	if (this.parameters) display += `-${this.parameters}b`;
	if (this.version) display += `-v${this.version}`;

	return display;
});

// DEFAULT EXPORT ==============================================================

export default model("LLM", LLMSchema);