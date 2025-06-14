// backend/models/payment.model.js

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    stripeCustomerId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeChargeId: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentMethodType: {
      type: String, // e.g., card, bank transfer, etc.
    },
    paymentStatus: {
      type: String, // e.g., succeeded, failed, pending
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String, // e.g., USD, EUR, etc.
    },
    paymentDate: {
      type: Date,
    },
    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;