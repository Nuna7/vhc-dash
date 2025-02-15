var express = require("express");
var router = express.Router();

const authMiddleware = require("../middleware/auth");

const userController = require("../controllers/user");

router.get("/", authMiddleware.sessionAuthCheck(), userController.panel);
router.post("/edit-info", authMiddleware.sessionAuthCheck(), userController.edit_user);

module.exports = router;
