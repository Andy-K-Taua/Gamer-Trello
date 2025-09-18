// backend/routes/auth.route.js

import express from "express";
import { checkAuth, subscribe, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup)
router.post("/subscribe", subscribe)
router.post("/logout", logout)
router.get("/check", protectRoute, checkAuth);

export default router; 