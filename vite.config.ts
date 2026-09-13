import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { buildCvHtml } from './src/data/cvHtml.ts'

/**
 * Writes the plain HTML CV out beside the island.
 *
 * It is generated rather than kept by hand so that it cannot fall behind the
 * data the island reads from, and it is served in dev too so the fallback can
 * be checked without a build.
 */
function cvPage(): Plugin {
  const PATH = '/cv.html'
  return {
    name: 'cv-page',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.url.split('?')[0] !== PATH) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(buildCvHtml())
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'cv.html',
        source: buildCvHtml(),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cvPage()],
  build: {
    // The whole island is needed on first paint, so it ships as one chunk;
    // three.js alone accounts for most of it.
    chunkSizeWarningLimit: 1400,
  },
})
