import express from 'express';
import * as subController from '../controllers/subscription.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkSubscriptionExpiryStatus } from "../middleware/subscription.middleware.js";

const router = express.Router();

// 1. Webhook
router.post("/webhook", subController.webhookHandler);

// 2. Checkout
router.post('/create-checkout-session', protectRoute, subController.createCheckoutSession);

// 3. Plan Selection
router.post('/select-plan', protectRoute, subController.selectPlan);

// 4. Status Verification
router.get("/status/verify", protectRoute, checkSubscriptionExpiryStatus, (req, res) => {
    return res.status(200).json({ status: "active", message: "Subscription is active" });
});

// 5. CRUD Operations
router.post('/', subController.createSubscription);
router.get('/', subController.getAllSubscriptions);
router.get('/:id', subController.getSubscriptionById);
router.patch('/:id', subController.updateSubscription);
router.delete('/:id', subController.cancelSubscription);

export default router;