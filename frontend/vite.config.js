//frontend/vite.config.js

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  envDir: '../backend',
  // publicDir: 'public',
  server: {
    hmr: true,
    proxy: {
      '/api': 'http://localhost:5001', // proxy requests from /api to your backend server
    },
  },
});