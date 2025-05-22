import { Router } from "express";
const router = Router();

import indexController from "../controllers/index.js";

router.get("/", indexController.home);

export default router;
