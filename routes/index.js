import { Router } from "express";

import indexController from "../controllers/index.js";

// ROUTING =====================================================================

const router = Router();

router.get("/", indexController.home);

// DEFAULT EXPORT ==============================================================

export default router;
