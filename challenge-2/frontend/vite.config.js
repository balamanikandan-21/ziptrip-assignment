import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Multi-Page Application setup.
// Each HTML file is a separate entry point => a real, full page load when you
// navigate between them (this is "multiple page", NOT a single-page app).
//   index.html -> the todos list page
//   todo.html  -> the single todo detail page (reads ?id=... from the URL)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        todo: resolve(__dirname, 'todo.html'),
      },
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the Express backend during development so the
    // frontend can use same-origin "/api/..." URLs.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
