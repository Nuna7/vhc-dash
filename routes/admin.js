import { Router } from "express";
const router = Router();

import { sessionAuthCheck } from "../middleware/auth.js";

import adminController from "../controllers/admin.js";

router.get("/user-depot", sessionAuthCheck(["admin"]), adminController.depot_get);
router.post("/user-depot", sessionAuthCheck(["admin"]), adminController.depot_post);

export default router;
