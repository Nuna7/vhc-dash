import { Router } from "express";
import rateLimit from "express-rate-limit";

import { flashAndRedirect } from "../helpers/flash.js";

import { sessionAuthCheck } from "../middleware/auth.js";

import rankerController from "../controllers/ranker.js";

// RATE LIMITERS ===============================================================

const RATE_MIN = 1
const ATTEMPTS = 5

const ballotLimiter = rateLimit({ // -------------------------------------------
	windowMs: RATE_MIN * 60 * 1000,
	max: ATTEMPTS,

	// rate‐limit by user rather than IP
	keyGenerator: req => req.user._id.toString(),

	handler: (req, res) => flashAndRedirect(req, res, "message", {
		type: "warn",
		msg: "User response rate too high. Please wait 5 minutes."
	}, "/ranker")
});

// ROUTING =====================================================================

const router = Router();

router.get("/", sessionAuthCheck(), rankerController.ranker);
router.post("/", sessionAuthCheck(), ballotLimiter, rankerController.post_ballot);

router.get("/history", sessionAuthCheck(), rankerController.history);

// DEFAULT EXPORT ==============================================================

export default router;
