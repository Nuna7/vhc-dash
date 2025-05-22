import { Router } from "express";
const router = Router();

import { sessionAuthCheck } from "../middleware/auth.js";

import rankerController from "../controllers/ranker.js";

router.get("/", sessionAuthCheck(), rankerController.ranker);
router.post("/", sessionAuthCheck(), rankerController.post_ballot);

export default router;
