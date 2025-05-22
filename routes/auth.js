import { Router } from "express";
const router = Router();

import passport from "passport";

import authController from "../controllers/auth.js";

router.get("/login", authController.login_get);
router.post("/login", authController.login_validate_post, passport.authenticate("local", { failWithError: true }), authController.login_success_post, authController.login_error_post);

router.get("/register", authController.register_get);
router.post("/register", authController.register_post);

router.post("/logout", authController.logout);

export default router;
