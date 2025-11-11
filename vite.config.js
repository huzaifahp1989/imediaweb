import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Use absolute base path so assets load correctly on deep routes
  // (e.g., /games) in production deployments like Netlify.
  // Relative base can cause requests like /games/assets/*.js which
  // return index.html instead of the actual asset, breaking the page.
  base: '/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
