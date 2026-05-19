// backend/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    const { email, password, mobile } = req.body;
    
    try {
        if (!email || !password || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 1. Check if the user already exists by email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // --- LOGIN TRACK ---
            // A. Verify the password matches
            const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // B. Verify the mobile number matches what they signed up with
            if (existingUser.mobile !== mobile.trim()) {
                return res.status(400).json({ message: "Mobile number does not match our records for this account" });
            }

            // C. Log them in (Generate JWT token cookie)
            generateToken(existingUser._id, res);

            return res.status(200).json({
                _id: existingUser._id,
                email: existingUser.email,
                mobile: existingUser.mobile,
                approvalStatus: existingUser.approvalStatus,
                isExistingUser: true // Flags frontend that this is a returning user
            });
        }

        // --- REGISTRATION TRACK ---
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Check if the mobile number is already taken by a different account
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
            isExistingUser: false // Flags frontend that this is a brand new account
        });

    } catch (error) {
        console.log("Error in unified auth controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};