var express = require("express");
var router = express.Router();

const passport = require('passport');

const authController = require("../controllers/auth");

router.get("/login", authController.login_get);
router.post("/login", authController.login_validate_post, passport.authenticate("local", { failWithError: true }), authController.login_success_post, authController.login_error_post);

router.post("/logout", authController.logout);

module.exports = router;
