import { body, validationResult } from "express-validator";

import PRC from "../models/PRC.js";
import RCV from "../models/RCV.js";

// RANKER ======================================================================

export async function ranker(req, res, next) {
	try {
		// find all PRCs not voted for by user
		const prcs = await PRC.aggregate([
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
		]);

		res.render("ranker/ranker", {
			title: "LLM Ranker",
			prc: prcs.length ? PRC.hydrate(prcs[0]) : undefined
		});
	}

	catch (err) { next(err); }
}

// submit ballot ---------------------------------------------------------------
export const post_ballot = [
	body("prc").isMongoId(),

	body().custom(async (body, { req }) => {
		try {
			const prc = await PRC.findById(body.prc);

			const validLLMIDs = prc.responses.map(response => response.llm.toString());

			const rankKeys = Object.keys(body).filter(key => key.startsWith("rank-"));
			const statusKeys = Object.keys(body).filter(key => key.startsWith("status-"));

			// make sure no extra/missing rank/status fields
			if (!(rankKeys.length == prc.responses.length || statusKeys.length == prc.responses.length)) {
				return Promise.reject("No. of rank/status fields does not match no. of PRC responses");
			}

			const seenRanks = new Set();
			const rankStatusPairs = [];

			for (let i = 0; i < prc.responses.length; i++) {
				const llmID = rankKeys[i].split("-")[1];
				const rankValue = body[rankKeys[i]];
				const statusValue = body[statusKeys[i]];

				// ensure rank/status pairs match and LLM IDs are valid
				if (llmID != statusKeys[i].split("-")[1]) return Promise.reject("Rank/status IDs do not match");
				if (!validLLMIDs.includes(llmID)) return Promise.reject("Invalid LLM ID");

				// ensure rank values are distinct
				if (seenRanks.has(rankValue)) return Promise.reject("Rank values are not unique");
				seenRanks.add(rankValue);

				// check if status value is valid
				if (!["pass", "fail"].includes(statusValue)) return Promise.reject("Invalid status value");

				rankStatusPairs.push({ rank: rankValue, status: statusValue });
			}

			// ensure all fail ranks are below all pass ranks
			const sortedPairs = rankStatusPairs.sort((a, b) => a.rank - b.rank);
			let foundFail = false;

			for (const status of sortedPairs) {
				if (!foundFail && status == "fail") foundFail = true;
				if (foundFail && status == "pass") return Promise.reject("Fail rank above pass rank");
			}

			return true;
		}

		catch (err) { throw new Error("Database error"); }
	}),

	async (req, res, next) => {
		try {
			const prc = await PRC.findById(req.body.prc)
				.populate("rcv responses.llm");

			const errors = validationResult(req);

			// TODO: implement syserror page/display
			if (!errors.isEmpty()) {
				return res.redirect("/ranker");
			}

			const models = prc.responses.map(response => response.llm._id);
			var ranking = Array(models.length);
			var failCount = 0;

			// insert LLM IDs into ranked positions
			models.forEach(model => {
				ranking[req.body[`rank-${model.toString()}`] - 1] = model;
				if (req.body[`status-${model.toString()}`] == "fail") failCount++;
			});

			// push ballot to associated RCV
			prc.rcv.ballots.push({
				voter: req.user._id,
				ranking: ranking,
				failCount: failCount,
				rationale: req.body.rationale
			});

			await prc.rcv.save();

			return res.redirect("/ranker");
		}

		catch (err) { next(err); }
	}
]

// USER RANK HISTORY ===========================================================

export async function history(req, res, next) {
	try {
		const userId = req.user._id;

		// run aggregation to find matching ballots and their PRCs
		const rawResults = await RCV.aggregate([
			{ $match: { "ballots.voter": userId } },
			{ $unwind: "$ballots" },
			{ $match: { "ballots.voter": userId } },
			{
				$lookup: {
					from: "prcs",
					localField: "_id",
					foreignField: "rcv",
					as: "prc"
				}
			},
			{ $unwind: "$prc" },
			{
				$project: {
					_id: "$ballots._id",
					prc: "$prc",
					ranking: "$ballots.ranking",
					failCount: "$ballots.failCount",
					rationale: "$ballots.rationale",
					timestamp: "$ballots.createdAt",
				}
			},
			{ $sort: { timestamp: -1 } }
		]);

		// hydrate PRC documents
		const hydratedResults = rawResults.map(result => ({
			...result,
			prc: PRC.hydrate(result.prc)
		}));

		res.render("ranker/history", {
			title: "LLM Ranker - History",
			ballots: hydratedResults
		});
	}

	catch (err) { next(err); }
}

// DEFAULT EXPORT ==============================================================

export default {
	ranker,
	post_ballot,
	history
}