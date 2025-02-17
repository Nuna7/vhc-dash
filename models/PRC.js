const mongoose = require("mongoose");
const MarkdownIt = require("markdown-it");

const { Schema } = mongoose;

const LLM = require("./LLM")
const RCV = require("./RCV")

const md = new MarkdownIt();

// implicit paraphrase model definition
const ParaphraseSchema = new Schema({
	llm: { type: Schema.Types.ObjectId, ref: "LLM", required: true },
	response: { type: String, required: true }
}, { _id: false });

// render paraphrase markdown as HTML
ParaphraseSchema.methods.renderContent = function() {
	return md.render(this.response);
}

const PRCSchema = new Schema({
	input: { type: String, required: true },
	responses: { type: [ParaphraseSchema], required: true },
	rcv: { type: Schema.Types.ObjectId, ref: "RCV", required: true }
}, { timestamps: true });

// deletion cascade
PRCSchema.pre("deleteMany", function(next) {
	// delete all RCVs associated with model 
	this.model.find(this.getQuery()).populate("rcv").then(prcs => {
		prcs.forEach(async prc => { await prc.rcv.deleteOne(); });
		next();
	});
});

module.exports = mongoose.model("PRC", PRCSchema);