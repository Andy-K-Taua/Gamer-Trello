// backend/routes/subscription.route.js

import express from 'express';
import subscriptionController from '../controllers/subscription.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkSubscriptionExpiryStatus } from "../middleware/subscription.middleware.js";

const router = express.Router();

// 1. SELECT SUBSCRIPTION PLAN (New route for the approval flow)
// This must be protected so we know exactly which user is choosing the plan
router.post('/select-plan', protectRoute, subscriptionController.selectPlan);

// 2. ISOLATED SUBSCRIPTION VERIFICATION
// This uses a concrete namespace prefix to avoid colliding with variable ID paths below
router.get("/status/verify", protectRoute, checkSubscriptionExpiryStatus, (req, res) => {
    return res.status(200).json({ status: "active", message: "Subscription is active" });
});

// --- Standard Subscription CRUD Routes ---
// Create a new subscription
router.post('/', subscriptionController.createSubscription);

// Get all subscriptions
router.get('/', subscriptionController.getAllSubscriptions);

// Get a specific subscription by ID (Dynamic strings like ':id' fall safely below absolute segments)
router.get('/:id', subscriptionController.getSubscriptionById);

// Update a subscription
router.patch('/:id', subscriptionController.updateSubscription);

// Cancel a subscription
router.delete('/:id', subscriptionController.cancelSubscription);

export default router;