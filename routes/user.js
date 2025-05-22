import { Router } from "express";
const router = Router();

import authMiddleware from "../middleware/auth.js";

import userController from "../controllers/user.js";

router.get("/", authMiddleware.sessionAuthCheck(), userController.panel);
router.post("/edit-info", authMiddleware.sessionAuthCheck(), userController.edit_user);
router.post("/edit-password", authMiddleware.sessionAuthCheck(), userController.edit_password);

export default router;
