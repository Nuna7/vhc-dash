// TODO:
// - ballot post form validation

const { body, check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const PRC = require("../models/PRC");
const RCV = require("../models/RCV");

// ranker view
exports.ranker = (req, res, next) => {
	PRC.aggregate([ // find all PRCs not voted for by user
		{
			$lookup: {
				from: RCV.collection.name,
				localField: "rcv",
				foreignField: "_id",
				as: "rcv"
			}
		},
		{ $unwind: "$rcv" },
		{ $match: { "rcv.ballots.voter": { $ne: req.user._id } } },
		{ $limit: 1 }
	])
		.then(aggregation => { // populate response LLMs and render view
			PRC.hydrate(aggregation[0]).populate("responses.llm").then(prc => {
				res.render("ranker", {
					title: "M.O. Ranker",
					prc: prc
				});
			});
		});
}

// submit ballot
exports.post_ballot = [
	body("prc").isMongoId(),

	(req, res, next) => {
		// if error in prc field, reload (jank, but i need to sleep)
		if (!validationResult(req).isEmpty()) { 
			console.log(validationResult(req));
			return res.redirect("/ranker"); 
		}

		PRC.findById(req.body.prc).populate("rcv").then(prc => {
			Object.keys(req.body).forEach(field => {
				if (field.startsWith("rank-")) {
					check(field).isInt({ min: 1, max: prc.responses.length }).custom(value => {
						return prc.responses.some(response => response.llm.equals(mongoose.Types.ObjectId(value.replace("rank-", ""))));
					});
				}
			});

			// if errors, reload (jank, but i need to sleep)
			if (!validationResult(req).isEmpty()) { 
				console.log(validationResult(req));
				return res.redirect("/ranker"); 
			}

			const models = prc.responses.map(({ llm }) => llm);
			var ranking = Array(models.length);
			var fail_count = 0;

			models.forEach(model => { // insert LLM IDs into ranked positions
				ranking[req.body[`rank-${model.toString()}`] - 1] = model;
				if (req.body[`status-${model.toString()}`] == "fail") fail_count++;
			});

			prc.rcv.ballots.push({ // push ballot to associated RCV
				voter: req.user._id,
				ranking: ranking,
				fail_count: fail_count
			});

			prc.rcv.save().then(() => {
				return res.redirect("/ranker");
			});
		});
	}
]