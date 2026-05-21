// backend/controllers/games.controller.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getGames = async (req, res) => {
  try {
    // 1. Find the absolute path to your active directory root ('gamer-trello')
    // This splits the path and slices it right up to your project root folder safely!
    const currentPath = path.resolve(__dirname);
    const rootIndex = currentPath.indexOf('gamer-trello');
    
    if (rootIndex === -1) {
      throw new Error("Could not automatically locate 'gamer-trello' root directory folder.");
    }
    
    const projectRoot = currentPath.substring(0, rootIndex + 'gamer-trello'.length);

    // 2. Map targets directly from the absolute project root anchor point
    let gamesDir = path.join(projectRoot, 'frontend', 'public', 'games');
    
    if (process.env.NODE_ENV === 'production') {
      gamesDir = path.join(projectRoot, 'frontend', 'dist', 'games');
    }

    console.log('=== TARGET PATH RESOLVED ===');
    console.log('Searching inside directory:', gamesDir);

    // 3. Read the directory files safely
    let files = [];
    try {
      files = await fs.readdir(gamesDir);
      console.log('Raw files discovered:', files);
    } catch (dirError) {
      console.warn(`Directory not found at ${gamesDir}. Falling back to empty array.`);
      return res.json([]); 
    }

    // 4. Map files to game entities
    const games = files
      .filter(file => !file.startsWith('.')) 
      .map((file) => ({
        id: file,
        name: file.replace(/\.[^/.]+$/, ''), // Remove file extension (e.g. "Sonic.smc" -> "Sonic")
      }));

    console.log('Sending game list payload:', games);
    return res.json(games);

  } catch (err) {
    console.error('Critical error in getGames controller:', err);
    return res.status(500).json({ error: 'Failed to fetch games roster' });
  }
};