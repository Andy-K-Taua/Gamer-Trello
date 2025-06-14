// backend/controllers/games.controller.js

import fs from 'fs/promises';
import path from 'path';

const gamesDir = path.join(process.cwd(), '../frontend/public/games');

export const getGames = async () => {
  try {
    const files = await fs.readdir(gamesDir);
    const games = files.map((file) => ({
      id: file,
      name: file.replace(/\.[^/.]+$/, ''), // Remove file extension
    }));
    return games;
  } catch (err) {
    throw err;
  }
};