// backend/routes/games.route.js 

import express from 'express';
import { getGames } from '../controllers/games.controller.js';

const router = express.Router();

router.get('/games', async (req, res) => {
  try {
    const games = await getGames();
    if (Array.isArray(games)) {
      res.json(games);
    } else {
      console.error('Invalid response:', games);
      res.status(500).send('Invalid response');
    }
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).send('Error fetching games');
  }
});

export default router;