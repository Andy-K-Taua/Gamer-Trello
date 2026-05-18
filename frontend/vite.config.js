import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    // This forces Vite v6 to use its fast lightningcss internal pipeline 
    // and prevents legacy PostCSS loaders from highjacking @import "tailwindcss"
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