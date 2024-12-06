import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  

  // Ensure FFmpeg and any other problematic libraries are handled properly
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'], // Exclude these libraries from pre-bundling
  },

  // Additional configuration for static assets
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ffmpeg: ['@ffmpeg/ffmpeg'], // Separates FFmpeg into its own chunk to avoid large bundle issues
        },
      },
    },
  },

  // Ensure correct base path for assets
  base: './', // Use './' to correctly resolve assets in local development and production
});
