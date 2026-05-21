// backend/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        // Wrap token verification to safely catch verification drop out crashes
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ message: "Unauthorized - Invalid or Expired Token" });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token Payload" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        req.user = user;

        return next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        // FIX: Return 401 instead of 500 so the frontend can catch it and redirect cleanly
        return res.status(401).json({ message: "Authentication sequence failed" });
    }
};

export default protectRoute;