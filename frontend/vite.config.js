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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'images/**/*.png'],
      manifest: {
        name: 'Gamer Trello Console',
        short_name: 'GamerTrello',
        description: 'Your ultimate mobile and desktop destination for retro game nostalgia.',
        theme_color: '#1d232a', // Clean matching background accent
        background_color: '#1d232a',
        display: 'standalone', // Emulates a native app environment by hiding browser bars
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
      }
    })
  ],
  css: {
    // This forces Vite to use its fast lightningcss internal pipeline 
    // and prevents legacy PostCSS loaders from hijacking @import "tailwindcss"
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