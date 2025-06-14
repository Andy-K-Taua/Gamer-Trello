// backend/middleware/subscription.middleware.js

import Subscription from "../models/subscription.model.js";

export const checkSubscriptionExpiryStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const subscription = await Subscription.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({ message: "No subscription found" });
        }
        if (subscription.endDate < new Date()) {
            subscription.status = 'inactive';
            await subscription.save();
            return res.status(401).json({ message: "Subscription has expired" });
        }
        res.json({ message: "Subscription is active" })
    } catch (error) {
        console.log("Error in checkSubscriptionStatus middleware: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export default checkSubscriptionExpiryStatus; 