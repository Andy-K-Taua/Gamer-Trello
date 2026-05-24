// frontend/vite.config.js

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
      // UPDATED: Added the EmulatorJS framework and emulator.min.js file paths to secure offline functionality
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'images/**/*.png',
        'EmulatorJS-4.2.1/data/loader.js',
        'EmulatorJS-4.2.1/data/emulator.min.js',
        'EmulatorJS-4.2.1/data/emulator.css',
        'EmulatorJS-4.2.1/data/version.json'
      ],
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
        maximumFileSizeToCacheInBytes: 10000000, // Increased to 10MB to cover larger core files
        cleanupOutdatedCaches: true, // IMPORTANT: Forces the service worker to delete old versions
        clientsClaim: true, // Forces the waiting service worker to become the active one immediately
        skipWaiting: true,  // Important for fast updates
        runtimeCaching: [
          {
            urlPattern: /.*(?:EmulatorJS-4.2.1|\.(?:json|js|css|wasm|nes|gb|gbc|gba|sfc|md))$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'retroarch-game-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              // ADD THIS: This helps prevent the Service Worker from being "stuck"
              networkTimeoutSeconds: 3,
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