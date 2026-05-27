import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Ensure your .env has STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // Use the latest API version
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;