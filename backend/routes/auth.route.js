// backend/routes/auth.route.js
import express from "express";
import { checkAuth, subscribe, logout, signup } from "../controllers/auth.controller.js"; // <-- Removed ', login'
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Both paths route to your unified signup function, which safely branches under the hood
router.post("/signup", signup);
router.post("/login", signup); 
router.post("/subscribe", subscribe);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);

export default router;