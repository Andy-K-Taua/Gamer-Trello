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
      default: "none", // Will be updated when they pick a tier
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // All new signups start here
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;