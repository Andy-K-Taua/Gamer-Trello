// backend/routes/games.route.js 

import express from 'express';
import { getGames } from '../controllers/games.controller.js';

const router = express.Router();

// Pass the controller directly as the route handler
router.get('/games', getGames);

export default router;