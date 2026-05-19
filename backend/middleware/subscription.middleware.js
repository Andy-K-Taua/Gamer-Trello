// backend/middleware/subscription.middleware.js
import Subscription from "../models/subscription.model.js";

export const checkSubscriptionExpiryStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const subscription = await Subscription.findOne({ userId });
        
        // 1. If no subscription record exists yet, treat it as expired/inactive (401) 
        // instead of a 404, so your frontend knows to redirect them to the /subscription page!
        if (!subscription) {
            return res.status(401).json({ message: "No subscription found. Please select a plan." });
        }
        
        // 2. If the subscription has expired
        if (subscription.endDate < new Date()) {
            subscription.status = 'inactive';
            await subscription.save();
            return res.status(401).json({ message: "Subscription has expired" });
        }
        
        // 3. Subscription is valid! Pass control over to the route handler's 200 OK response
        next();
        
    } catch (error) {
        console.log("Error in checkSubscriptionStatus middleware: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export default checkSubscriptionExpiryStatus;