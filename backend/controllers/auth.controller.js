// backend/controllers/auth.controller.js

import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

// 1. UNIFIED SIGNUP / LOGIN CONTROLLER
export const signup = async (req, res) => {
    const { email, password, mobile } = req.body;

    try {
        if (!email || !password || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const trimmedMobile = mobile.trim();

        // Check if the user already exists by email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // --- LOGIN TRACK ---
            const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Verify mobile matches database record to guarantee account ownership
            if (existingUser.mobile !== trimmedMobile) {
                return res.status(400).json({ message: "Mobile number does not match our records for this account" });
            }

            generateToken(existingUser._id, res);

            // Return full operational state flags to guide frontend redirect engines
            return res.status(200).json({
                _id: existingUser._id,
                email: existingUser.email,
                mobile: existingUser.mobile,
                approvalStatus: existingUser.approvalStatus, // Crucial for routing straight to games vs pending block
                subscriptionPlan: existingUser.subscriptionPlan || "none",
                isExistingUser: true
            });
        }

        // --- REGISTRATION TRACK ---
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Ensure mobile unique constraint doesn't collision with an existing account
        const existingMobile = await User.findOne({ mobile: trimmedMobile });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number is already registered to another account" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            mobile: trimmedMobile,
            subscriptionPlan: "none",      // Starts explicitly blank for subscription route mapping
            approvalStatus: "pending"      // Held for CLI admin check
        });

        await newUser.save();
        generateToken(newUser._id, res);

        return res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            mobile: newUser.mobile,
            approvalStatus: newUser.approvalStatus,
            subscriptionPlan: newUser.subscriptionPlan,
            isExistingUser: false
        });

    } catch (error) {
        console.log("Error in unified auth controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 2. LOGOUT CONTROLLER
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 3. SUBSCRIBE CONTROLLER 
export const subscribe = async (req, res) => {
    try {
        res.status(200).json({ message: "Subscription logic route active" });
    } catch (error) {
        console.log("Error in subscribe controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 4. CHECK AUTH CONTROLLER
export const checkAuth = async (req, res) => {
    try {
        // Instead of trusting req.user (the JWT snapshot),
        // fetch the latest version of this user from the DB
        const freshUser = await User.findById(req.user._id).select("-password");

        if (!freshUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ authUser: freshUser });
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const masterLogin = async (req, res) => {
    const { mobile } = req.body;
    console.log("DEBUG: Querying DB for mobile:", `"${mobile}"`);

    // 1. Try finding by the EXACT ID we know exists
    const testUser = await User.findById("6a1bb0cb56c10c83c76b1fe7");
    console.log("DEBUG: Can we find user by ID?", !!testUser);

    // 2. Try finding by mobile with a case-insensitive regex
    const user = await User.findOne({ mobile: { $regex: new RegExp("^" + mobile.trim() + "$", "i") } });
    console.log("DEBUG: User found by Regex mobile match?", !!user);

    if (!user) {
        return res.status(404).json({ message: "Master account not found" });
    }

    // console.log("DEBUG: Attempting master login for mobile:", mobile);
    // console.log("DEBUG: Env variable:", process.env.VITE_MASTER_MOBILE_NUMBER);

    // Compare against the server's environment variable
    if (mobile === process.env.MASTER_MOBILE_NUMBER) {
        const user = await User.findOne({ mobile: String(mobile).trim() });

        console.log("DEBUG: User found in DB:", !!user);

        if (!user) return res.status(404).json({ message: "Master account not found" });

        const token = generateToken(user._id, res);

        return res.status(200).json({
            message: "Master access granted",
            user: user
        });
    }

    res.status(401).json({ message: "Invalid credentials" });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName } = req.body;
        const userId = req.user._id;

        // Use { new: true } to return the document AFTER the update is applied
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic, fullName },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // --- NEW: Emit the update to all connected clients ---
        // Ensure that your app.set("io", io) was called in your server entry file (e.g., server.js)
        const io = req.app.get("io");
        if (io) {
            io.emit("userUpdated", updatedUser);
        }
        // ----------------------------------------------------

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};