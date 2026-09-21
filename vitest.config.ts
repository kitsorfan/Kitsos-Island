import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * The tests, kept apart from vite.config.ts.
 *
 * The app's config builds the island: it generates the plain HTML CV and
 * splits the engine into its own chunk, and neither of those has anything to
 * say about a test run. Keeping the two files apart means a change to how the
 * island ships can never quietly change what the tests are running against.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    /**
     * Most of what is tested here is arithmetic — collisions, lift timings,
     * flight paths — and wants no DOM at all. The files that do want one say
     * so at the top with `@vitest-environment jsdom`, so the fast majority
     * are not made to pay for a document they never touch.
     */
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      /**
       * What is deliberately not measured: the data tables and translations
       * are declarations rather than behaviour, and the r3f components are
       * meshes and materials that a headless run cannot render. Their logic
       * has been pulled into plain modules, and those are measured.
       */
      exclude: [
        'src/data/**',
        'src/i18n/el/**',
        'src/world/**',
        'src/main.tsx',
        'src/types.ts',
        'src/test/**',
        'src/**/*.d.ts',
      ],
    },
  },
})
