// backend/fixMaster.js

import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const fixMaster = async () => {
  await connectDB();
  const masterMobile = process.env.VITE_MASTER_MOBILE_NUMBER;
  
  // Find a user with the NEW mobile number
  let user = await User.findOne({ mobile: masterMobile });
  
  if (!user) {
    console.log(`Creating new master user with mobile: ${masterMobile}`);
    user = new User({
      email: "master@gamer-trello.com",
      password: "temporarypassword123",
      mobile: masterMobile,
      approvalStatus: "approved",
      subscriptionPlan: "premium"
    });
    await user.save();
  } else {
    console.log("Master user found, ensuring status is approved.");
    user.approvalStatus = 'approved';
    user.subscriptionPlan = 'premium';
    await user.save();
  }
  process.exit();
};

fixMaster();