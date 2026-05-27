// backend/controllers/webhook.controller.js

import { stripe, STRIPE_WEBHOOK_SECRET } from "../lib/stripe.js";
import User from "../models/user.model.js";

const processedEvents = new Set();

export const webhookHandler = async (req, res) => {
    console.log("Headers received:", req.headers);
    let event;

    // TEST MODE
    const isTestMode = req.headers['x-test-mode'] === 'true';

    if (isTestMode) {
        event = JSON.parse(req.body.toString());
        console.log("TEST MODE: Bypassing signature verification.");
    } else {
        const sig = req.headers['stripe-signature'];
        try {
            // Use the 'stripe' object you imported at the top
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    // Idempotency Check
    if (processedEvents.has(event.id)) {
        return res.status(200).send("Event already processed");
    }
    processedEvents.add(event.id);

    // Handle event...
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            try {
                const userId = session.metadata?.userId;
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        hasPaid: true,
                        stripeCustomerId: session.customer
                    });
                }
            } catch (err) {
                return res.status(500).send("Database Update Error");
            }
            break;
    }

    return res.status(200).json({ received: true });
};