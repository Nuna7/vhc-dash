var express = require("express");
var router = express.Router();

const authMiddleware = require("../middleware/auth");

const rankerController = require("../controllers/ranker");

router.get("/", authMiddleware.sessionAuthCheck(), rankerController.ranker);
router.post("/", authMiddleware.sessionAuthCheck(), rankerController.post_ballot);

module.exports = router;
