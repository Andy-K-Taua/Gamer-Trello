// backend/controllers/games.controller.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getGames = async (req, res) => {
  try {
    // 1. Dynamically locate the games folder
    // Locally, it's in public/games. On Render, it's in dist/games.
    let gamesDir = path.resolve(__dirname, '../../../frontend/public/games');
    
    if (process.env.NODE_ENV === 'production') {
      // In production on Render, look inside the compiled dist folder
      gamesDir = path.resolve(__dirname, '../../frontend/dist/games');
    }

    console.log('Attempting to read games from directory:', gamesDir);

    // 2. Read the directory files safely
    let files = [];
    try {
      files = await fs.readdir(gamesDir);
    } catch (dirError) {
      console.warn(`Directory not found at ${gamesDir}. Falling back to empty array.`);
      return res.json([]); // Return an empty array gracefully instead of crashing
    }

    // 3. Map files to game entities
    const games = files
      .filter(file => !file.startsWith('.')) // Ignore hidden system files like .DS_Store
      .map((file) => ({
        id: file,
        name: file.replace(/\.[^/.]+$/, ''), // Remove file extension
      }));

    // 4. Send the data back to the frontend!
    return res.json(games);

  } catch (err) {
    console.error('Critical error in getGames controller:', err);
    return res.status(500).json({ error: 'Failed to fetch games roster' });
  }
};