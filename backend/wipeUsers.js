import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js"; // Make sure this path points to your user model

dotenv.config();

const wipeDatabase = async () => {
    try {
        // Connect to your MongoDB using your existing .env URI
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully...");

        // This deletes EVERY document inside the users collection
        const result = await User.deleteMany({});
        console.log(`Success! Deleted ${result.deletedCount} users from the database.`);

        // Close the connection cleanly
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error wiping database:", error);
        process.exit(1);
    }
};

wipeDatabase();