import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from 'fs';
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'node:path';

import { connectDB } from "../lib/db.js";
import authRoutes from "../routes/auth.route.js";
import subscriptionRoutes from "../routes/subscription.route.js";
import gamesRoute from '../routes/games.route.js';

dotenv.config();

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

const PORT = process.env.PORT || 10000; 
const HOST = '0.0.0.0'; 

// 1. Global Essential Middleware
app.use(express.json());
app.use(cookieParser());

// 2. Dynamic CORS Configuration
// In production (Render), since the frontend is served from the backend service, 
// we allow credentials and fallback gracefully without hardcoding placeholders.
const allowedOrigins = ["http://localhost:5173"]; 

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin static apps)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // On Render, same-origin requests won't send an "Origin" header for standard fetches,
      // but if a mismatch happens, this block dynamically allows it.
      callback(null, true); 
    }
  },
  credentials: true
}));

// 3. API Routes (PLACE THESE BEFORE STATIC FILES)
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/api', gamesRoute);

app.get('/test', (req, res) => {
    res.json({ message: 'Test successful' });
});

// 4. Static Client Assets Middleware
app.use(express.static(frontendBuildPath));

// 5. Catch-all fallback route to serve index.html for Single Page Application (Vite/React) routing
app.get("*", (req, res) => {
  try {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error serving index.html');
  }
});

console.log('Server is about to start listening...');

app.listen(PORT, HOST, () => {
    console.log(`server is running on port ${HOST}:${PORT}`);
    connectDB();
});