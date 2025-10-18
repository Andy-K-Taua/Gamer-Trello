// backend/src/index.js

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"

import { connectDB } from "../lib/db.js"
import authRoutes from "../routes/auth.route.js";
import subscriptionRoutes from "../routes/subscription.route.js";
import gamesRoute from '../routes/games.route.js';
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'node:path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
console.log('frontendBuildPath:', frontendBuildPath);

const PORT = process.env.PORT || 10000; 
const HOST = '0.0.0.0'; 

app.use(express.json());
app.use(express.static(frontendBuildPath));
app.use(cookieParser());

// app.use((req, res, next) => {
//     console.log(`Received request: ${req.method} ${req.url}`);
//     console.log('Request headers:', req.headers);
//     res.on('finish', () => {
//       console.log('Response headers:', res.getHeaders());
//     });
//     next();Soni
//   });

console.log('Using dynamic CORS origin');
app.use(cors({
      origin: '*',
      credentials: true,
}));

app.get('/test', (req, res) => {
    res.json({ message: 'Test successful' });
});

app.use("/api/auth", authRoutes)
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/api', gamesRoute);

app.use((req, res) => {
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
    connectDB()
});