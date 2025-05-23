import { Router } from "express";

import { sessionAuthCheck } from "../middleware/auth.js";

import adminController from "../controllers/admin.js";

// ROUTING =====================================================================

const router = Router();

router.get("/user-depot", sessionAuthCheck({ roles: ["admin"] }), adminController.depot_get);
router.post("/user-depot", sessionAuthCheck({ roles: ["admin"] }), adminController.depot_post);

// DEFAULT EXPORT ==============================================================

export default router;
