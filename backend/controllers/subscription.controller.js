// backend/controllers/subscription.controller.js

import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js'; // Imported User model to manage approval states
import { stripe } from "../lib/stripe.js";

// 1. SELECT PLAN & MARK PENDING FOR CLI APPROVAL (New Method)
const selectPlan = async (req, res) => {
  try {
    const { plan } = req.body; // e.g., "Premium", "Basic"

    if (!plan) {
      return res.status(400).json({ message: "Plan selection is required" });
    }

    // Find the logged-in user from the authentication token context
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update their status to pending and save their chosen plan name
    user.subscriptionPlan = plan;
    user.approvalStatus = 'pending';
    await user.save();

    res.status(200).json({
      message: "Plan selected successfully, pending admin approval.",
      subscriptionPlan: user.subscriptionPlan,
      approvalStatus: user.approvalStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;

    const priceMap = {
      standard: 'price_1TbXImGuR5zwChHMxqdxR6JA',
      premium: 'price_1TbWgVGuR5zwChHMxySDXI15'
    };

    const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: priceMap[plan],
      quantity: 1,
    },
  ],
  mode: 'subscription',
  // Use process.env.CLIENT_URL
  success_url: `${process.env.CLIENT_URL}/subscription?payment=success`,
  cancel_url: `${process.env.CLIENT_URL}/subscription`,
  metadata: {
    userId: req.user._id.toString(),
  },
});

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("FULL STRIPE ERROR:", error);
    
    res.status(500).json({ message: "Failed to create checkout session", error: error.message });
  }
};

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const subscription = new Subscription({
      userId: req.body.userId,
      planId: req.body.planId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: 'pending',
    });
    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('userId');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('userId');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel a subscription
const cancelSubscription = async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Checking subscription status
const checkSubscriptionExpiryStatus = async (req, res) => {
  try {
    res.json({ subscriptionStatus: req.subscriptionStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  selectPlan,
  createCheckoutSession,
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  checkSubscriptionExpiryStatus,
};