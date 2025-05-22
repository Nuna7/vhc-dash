import { Router } from "express";

import { sessionAuthCheck } from "../middleware/auth.js";

import rankerController from "../controllers/ranker.js";

// ROUTING =====================================================================

const router = Router();

router.get("/", sessionAuthCheck(), rankerController.ranker);
router.post("/", sessionAuthCheck(), rankerController.post_ballot);

// DEFAULT EXPORT ==============================================================

export default router;
