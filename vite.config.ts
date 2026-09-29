import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Relative base path for universal hosting compatibility (GitHub Pages, Netlify, Vercel)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
