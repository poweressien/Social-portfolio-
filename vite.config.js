import { defineConfig } from 'vite';

// three.js is loaded with a dynamic import in src/main.js, so it ships as its own chunk
// and the feed paints before the 3D background arrives.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
  },
});
