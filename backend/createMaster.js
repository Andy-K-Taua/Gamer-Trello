import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const createMaster = async () => {
  await connectDB();
  const mobile = process.env.VITE_MASTER_MOBILE_NUMBER;
  
  const existing = await User.findOne({ mobile });
  if (existing) {
    console.log("Master user already exists.");
  } else {
    const master = new User({
      email: "master@gamer-trello.com",
      password: "temporarypassword123", 
      mobile: mobile,
      approvalStatus: "approved"
    });
    await master.save();
    console.log("Master user created successfully!");
  }
  process.exit();
};

createMaster();