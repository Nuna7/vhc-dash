import { Router } from "express";

import { sessionAuthCheck } from "../middleware/auth.js";

import userController from "../controllers/user.js";

// ROUTING =====================================================================

const router = Router();

router.get("/", sessionAuthCheck(), userController.panel);
router.post("/edit-info", sessionAuthCheck({ returnTo: "/user" }), userController.edit_user);
router.post("/edit-password", sessionAuthCheck({ returnTo: "/user" }), userController.edit_password);

// DEFAULT EXPORT ==============================================================

export default router;
