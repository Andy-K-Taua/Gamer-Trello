// backend/controllers/subscription.controller.js

import Subscription from '../models/subscription.model.js';

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
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  checkSubscriptionExpiryStatus,
};