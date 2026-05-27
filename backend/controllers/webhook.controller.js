// backend/controllers/webhook.controller.js

import { getStripe } from "../lib/stripe.js";
import User from "../models/user.model.js";

// Simple in-memory cache for idempotency (Note: Use Redis in production)
const processedEvents = new Set();

export const webhookHandler = async (req, res) => {
    const stripe = getStripe();
    console.log("Headers received:", req.headers);
    let event;

    // TEST MODE: Bypass signature verification if we are testing locally
    // This allows the 'test-webhook.js' script to work without a real Stripe signature
    const isTestMode = req.headers['x-test-mode'] === 'true';

    if (isTestMode) {
        // req.body is a Buffer because of express.raw() in index.js
        event = JSON.parse(req.body.toString());
        console.log("TEST MODE: Bypassing signature verification.");
    } else {
        const sig = req.headers['stripe-signature'];
        try {
            // Verify the event with Stripe's signature
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    // Idempotency Check: Prevent processing the same event multiple times
    if (processedEvents.has(event.id)) {
        return res.status(200).send("Event already processed");
    }
    processedEvents.add(event.id);

    console.log("Successfully processed event type:", event.type);

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout Session Completed:', session.id);

            // Update user in MongoDB
            try {
                const userId = session.metadata?.userId;
                if (userId) {
                    // Update user's payment status and store their Stripe Customer ID
                    await User.findByIdAndUpdate(userId, {
                        hasPaid: true,
                        stripeCustomerId: session.customer
                    });
                    console.log(`User ${userId} payment confirmed.`);
                } else {
                    console.warn("No userId found in session metadata.");
                }
            } catch (err) {
                console.error("Failed to update user payment status in MongoDB:", err);
                return res.status(500).send("Database Update Error");
            }
            break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            console.log('Subscription Event:', event.type, subscription.id);
            // Add logic here if you want to handle mid-subscription changes
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    // Respond to Stripe to acknowledge receipt of the event
    return res.status(200).json({ received: true });
};