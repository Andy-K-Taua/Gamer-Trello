// backend/routes/auth.route.js

console.log("--- AUTH ROUTES FILE LOADED ---");

import express from "express";
import { checkAuth, subscribe, logout, signup, masterLogin } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.use((req, res, next) => {
//     console.log(`DEBUG: Request received at: ${req.method} ${req.originalUrl}`);
//     next();
// });

// Both paths route to your unified signup function, which safely branches under the hood
router.post("/signup", signup);
router.post("/login", signup); 
router.post("/subscribe", subscribe);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);
router.post("/master-login", masterLogin);

export default router;