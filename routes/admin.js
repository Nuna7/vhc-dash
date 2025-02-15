var express = require("express");
var router = express.Router();

const authMiddleware = require("../middleware/auth");

const adminController = require("../controllers/admin");

router.get("/user-depot", authMiddleware.sessionAuthCheck(["admin"]), adminController.depot_get);
router.post("/user-depot", authMiddleware.sessionAuthCheck(["admin"]), adminController.depot_post);

module.exports = router;
