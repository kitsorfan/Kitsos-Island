import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The whole island is needed on first paint, so it ships as one chunk;
    // three.js alone accounts for most of it.
    chunkSizeWarningLimit: 1400,
  },
})
