// backend/lib/stripe.js

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

export const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing in environment variables!");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24', // Use the latest API version
    });
};