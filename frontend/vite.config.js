// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include standard structural graphic assets
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'images/**/*.png'],
      manifest: {
        name: 'Gamer Trello Console',
        short_name: 'GamerTrello',
        description: 'Your ultimate mobile and desktop destination for retro game nostalgia.',
        theme_color: '#1d232a',
        background_color: '#1d232a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // Advanced service worker behaviors handling binary file assets
      workbox: {
        runtimeCaching: [
          {
            // Intercepts and caches emulator engine assets and game ROMs matching these routes
            urlPattern: /.*\.(?:json|js|css|wasm|nes|gb|gbc|gba|sfc|md)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'retroarch-game-assets',
              expiration: {
                maxEntries: 100, // Safe ceiling for your retro catalog
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days persistence window
              },
              cacheableResponse: {
                statuses: [0, 200], // Caches standard responses securely
              },
            },
          },
        ],
      },
    })
  ],
  css: {
    transformer: 'lightningcss' 
  },
  envDir: '../backend',
  build: {
    outDir: 'dist',
    cssMinify: 'lightningcss'
  },
  server: {
    hmr: true,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});