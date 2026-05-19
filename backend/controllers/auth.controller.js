// backend/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js"; // Adjust helper path if different

export const signup = async (req, res) => {
    const { email, password, mobile } = req.body;
    
    try {
        if (!email || !password || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const existingMobile = await User.findOne({ mobile });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number is already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            mobile
        });

        await newUser.save();
        generateToken(newUser._id, res);
        
        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            mobile: newUser.mobile,
            approvalStatus: newUser.approvalStatus
        });
    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const subscribe = async (req, res) => {
    // Your existing subscribe logic here
};

// This is the crucial check auth controller your router needs!
export const checkAuth = async (req, res) => {
    try {
        // req.user is set by your protectRoute middleware
        res.status(200).json({ authUser: req.user });
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};