// backend/routes/subscription.route.js

import express from 'express';
import subscriptionController from '../controllers/subscription.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkSubscriptionExpiryStatus } from "../middleware/subscription.middleware.js";

const router = express.Router();

// 1. SELECT SUBSCRIPTION PLAN (New route for the approval flow)
// This must be protected so we know exactly which user is choosing the plan
router.post('/select-plan', protectRoute, subscriptionController.selectPlan);

// Check subscription expiry
router.get("/check-expiry", protectRoute, checkSubscriptionExpiryStatus);

// --- Standard Subscription CRUD Routes ---
// Create a new subscription
router.post('/', subscriptionController.createSubscription);

// Get all subscriptions
router.get('/', subscriptionController.getAllSubscriptions);

// Get a specific subscription by ID
router.get('/:id', subscriptionController.getSubscriptionById);

// Update a subscription
router.patch('/:id', subscriptionController.updateSubscription);

// Cancel a subscription
router.delete('/:id', subscriptionController.cancelSubscription);

export default router;