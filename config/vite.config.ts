import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { buildCvHtml } from '../src/features/cv/cvHtml.ts'
import { personLdScript } from '../src/features/cv/personLd.ts'
import { RESUME_FONT, buildResumeHtml } from '../src/features/cv/resumeHtml.ts'
import { readResumeFont } from './resumeFont.ts'

/**
 * Writes the plain HTML CVs out beside the island: the long one at /cv.html,
 * and the two-page printed one at /resume.html that the PDF is made from,
 * with the Inter file the second one is set in.
 *
 * They are generated rather than kept by hand so that they cannot fall behind
 * the data the island reads from, and they are served in dev too so the
 * fallbacks can be checked without a build.
 */
function cvPage(): Plugin {
  /** A file served by the dev server and written into the build alike. */
  interface Generated {
    type: string
    body: () => string | Uint8Array
  }
  const FILES: Record<string, Generated> = {
    'cv.html': { type: 'text/html; charset=utf-8', body: buildCvHtml },
    'resume.html': {
      type: 'text/html; charset=utf-8',
      body: () => buildResumeHtml(),
    },
    [RESUME_FONT.slice(1)]: { type: 'font/woff2', body: readResumeFont },
  }
  return {
    name: 'cv-page',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = FILES[req.url?.split('?')[0].slice(1) ?? '']
        if (!file) return next()
        res.setHeader('Content-Type', file.type)
        res.end(file.body())
      })
    },
    generateBundle() {
      for (const [fileName, file] of Object.entries(FILES)) {
        this.emitFile({ type: 'asset', fileName, source: file.body() })
      }
    },
  }
}

/**
 * Puts the JSON-LD Person into the island's <head>, from the CV data.
 *
 * A data block, not a script: the browser never runs it, so the CSP's
 * script-src has nothing to say about it.
 */
function personLd(): Plugin {
  return {
    name: 'person-ld',
    transformIndexHtml: () => [
      {
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        children: personLdScript(),
        injectTo: 'head',
      },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig({
  /*
   * The island lives a directory up: this file sits in config/ with the rest
   * of the tooling, but the project it builds is the repo root.
   *
   * Resolved off this file's own URL rather than written as '..', because a
   * relative root is taken against the working directory and not against the
   * config — so `npm run build` from anywhere but the root looked for
   * index.html in the wrong place.
   */
  root: fileURLToPath(new URL('..', import.meta.url)),
  plugins: [react(), cvPage(), personLd()],
  build: {
    /**
     * three.js and the r3f helpers on top of it come to well over half the
     * island and change only when a dependency is bumped, so they ship apart
     * from the island itself, which changes constantly. A visitor coming back
     * after an edit re-downloads the island and keeps the engine.
     */
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'drei', test: /node_modules[\\/]@react-three[\\/]/ },
          ],
        },
      },
    },
    // Enough room for the engine chunk above, and not a byte more: the point
    // of the limit is to say something when the island grows a second one.
    chunkSizeWarningLimit: 800,
  },
})
