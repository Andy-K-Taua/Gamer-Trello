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

        // Check if the user already exists by email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // --- LOGIN TRACK ---
            const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            if (existingUser.mobile !== mobile.trim()) {
                return res.status(400).json({ message: "Mobile number does not match our records for this account" });
            }

            generateToken(existingUser._id, res);

            return res.status(200).json({
                _id: existingUser._id,
                email: existingUser.email,
                mobile: existingUser.mobile,
                approvalStatus: existingUser.approvalStatus,
                isExistingUser: true
            });
        }

        // --- REGISTRATION TRACK ---
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingMobile = await User.findOne({ mobile });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number is already registered to another account" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            mobile: mobile.trim()
        });

        await newUser.save();
        generateToken(newUser._id, res);
        
        return res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            mobile: newUser.mobile,
            approvalStatus: newUser.approvalStatus,
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

// 3. SUBSCRIBE CONTROLLER (Fallback placeholder if referenced)
export const subscribe = async (req, res) => {
    try {
        res.status(200).json({ message: "Subscription logic route active" });
    } catch (error) {
        console.log("Error in subscribe controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 4. CHECK AUTH CONTROLLER (The missing link causing the crash)
export const checkAuth = async (req, res) => {
    try {
        res.status(200).json({ authUser: req.user });
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};