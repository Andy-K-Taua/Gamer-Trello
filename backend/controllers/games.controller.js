// backend/controllers/games.controller.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getGames = async (req, res) => {
  try {
    let gamesDir = '';

    // 1. Detect if running inside Render's live infrastructure container environment
    if (process.env.RENDER) {
      // Look directly relative to the active Node execution work context root
      gamesDir = path.resolve(process.cwd(), 'frontend/dist/games');
      
      // Safety step: If the execution root path already includes the backend directory, walk back one level
      if (process.cwd().endsWith('backend')) {
        gamesDir = path.resolve(process.cwd(), '../frontend/dist/games');
      }
    } else {
      // 2. Local fallback development path routing for your Mac Desktop environment
      const currentPath = path.resolve(__dirname);
      const rootIndex = currentPath.indexOf('gamer-trello');
      
      if (rootIndex !== -1) {
        const projectRoot = currentPath.substring(0, rootIndex + 'gamer-trello'.length);
        gamesDir = path.join(projectRoot, 'frontend', 'public', 'games');
      } else {
        // Emergency relative step fallback if the root directory folder is renamed locally
        gamesDir = path.resolve(__dirname, '../../../frontend/public/games');
      }
    }

    // console.log('=== TARGET PATH CONFIGURATION RESOLVED ===');
    // console.log('Searching inside directory:', gamesDir);

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

    // console.log('Sending game list payload:', games);
    return res.json(games);

  } catch (err) {
    console.error('Critical error in getGames controller:', err);
    return res.status(500).json({ error: 'Failed to fetch games roster' });
  }
};