// backend/middleware/subscription.middleware.js

import Subscription from "../models/subscription.model.js";

export const checkSubscriptionExpiryStatus = async (req, res, next) => {
    try {
        // 1. Safety check to make sure protectRoute actually passed a valid user object
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                message: "User session not found. Please log in again." 
            });
        }

        const userId = req.user._id;
        const subscription = await Subscription.findOne({ userId });
        
        // 2. If no subscription record exists yet, treat it as expired/inactive (401) 
        // instead of a 404, so your frontend knows to redirect them to the /subscription page!
        if (!subscription) {
            return res.status(401).json({ message: "No subscription found. Please select a plan." });
        }
        
        // 3. If the subscription has expired
        if (subscription.endDate && subscription.endDate < new Date()) {
            subscription.status = 'inactive';
            await subscription.save();
            return res.status(401).json({ message: "Subscription has expired" });
        }
        
        // 4. Subscription is valid! Pass control over to the route handler's 200 OK response
        return next();
        
    } catch (error) {
        console.log("Error in checkSubscriptionStatus middleware: ", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export default checkSubscriptionExpiryStatus;