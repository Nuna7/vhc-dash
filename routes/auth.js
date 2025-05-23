import { Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";

import { flashAndRedirect } from "../utils/flash.js";

import authController from "../controllers/auth.js";

// RATE LIMITERS ===============================================================

const LOGIN_RATE_MIN = 5
const REG_RATE_MIN = 10
const ATTEMPTS = 5

// login -----------------------------------------------------------------------
const loginAuthLimiter = rateLimit({
	windowMs: LOGIN_RATE_MIN * 60 * 1000,
	max: ATTEMPTS,

	handler: (req, res) => flashAndRedirect(req, res, "message", {
		type: "warn",
		msg: `Too many auth. attempts from this IP. Please wait ${LOGIN_RATE_MIN} minutes.`
	}, "/login")
});

// registration ----------------------------------------------------------------
const registrationAuthLimiter = rateLimit({
	windowMs: REG_RATE_MIN * 60 * 1000,
	max: ATTEMPTS,

	handler: (req, res) => flashAndRedirect(req, res, "message", {
		type: "warn",
		msg: `Too many registration requests from this IP. Please wait ${REG_RATE_MIN} minutes.`
	}, "/register")
});

// ROUTING =====================================================================

const router = Router();

router.get("/login", authController.login_get);
router.post("/login", loginAuthLimiter, authController.login_validate_post, passport.authenticate("local", { failWithError: true }), authController.login_success_post, authController.login_error_post);

router.get("/register", authController.register_get);
router.post("/register", registrationAuthLimiter, authController.register_post);

router.post("/logout", authController.logout);

// DEFAULT EXPORT ==============================================================

export default router;
