// backend/src/index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import fs from 'fs';
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'node:path';

import { connectDB } from "../lib/db.js";
import authRoutes from "../routes/auth.route.js";
import subscriptionRoutes from "../routes/subscription.route.js";
import gamesRoute from '../routes/games.route.js';
import { webhookHandler } from "../controllers/webhook.controller.js";


console.log("DEBUG: Checking Stripe Secret Key:", process.env.STRIPE_SECRET_KEY ? "FOUND" : "MISSING");


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');

console.log('frontendBuildPath:', frontendBuildPath);

// Verify the build folder exists on Render
fs.readdir(frontendBuildPath, (err, files) => {
  if (err) {
    console.error('Error reading dist folder:', err);
  } else {
    console.log('Files in dist folder:', files);
  }
});

// Force check Render's dynamic port assignment
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// 1. Mount the Webhook route BEFORE express.json()
// We use express.raw({ type: 'application/json' }) to get the raw body needed for signature verification
app.post("/api/subscriptions/webhook", express.raw({ type: 'application/json' }), webhookHandler);
// 1. Global Essential Middleware
app.use(express.json());
app.use(cookieParser());

// 2. Dynamic CORS Configuration
const allowedOrigins = ["http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.path}`);
  next();
});

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/api', gamesRoute);

app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

// 4. Static Client Assets Middleware
app.use(express.static(frontendBuildPath));

// 5. Catch-all fallback - Use 'app.get' specifically
app.get('*', (req, res, next) => {
  // If the path starts with /api, we already know the route doesn't exist
  // because it didn't match the routes defined above.
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Otherwise, serve the SPA
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

console.log('Server is about to start listening...');

app.listen(PORT, HOST, () => {
  console.log(`server is running on port ${HOST}:${PORT}`);
  connectDB();
});