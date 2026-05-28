// backend/lib/stripe.js

import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Update this section:
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

export const getStripe = () => {
    return stripe;
};