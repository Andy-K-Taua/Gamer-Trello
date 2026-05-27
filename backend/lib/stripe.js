// backend/lib/stripe.js

import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// 1. Export the webhook secret for use in the controller
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// 2. Export the initialized Stripe instance as 'stripe'
// Make sure this line exists!
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24',
});