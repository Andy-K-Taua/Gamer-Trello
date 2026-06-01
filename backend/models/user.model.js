// backend/models/user.models.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      default: "none",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    hasPaid: { 
      type: Boolean, 
      default: false 
    },
    stripeCustomerId: String,
    
    // --- New Profile Fields ---
    fullName: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "user", // Default role
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;