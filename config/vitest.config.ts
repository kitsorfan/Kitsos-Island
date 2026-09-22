import { fileURLToPath } from 'node:url'
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
  /* As with vite.config.ts: the tooling sits in config/, the code it runs
     against is the repo root, resolved off this file rather than the cwd. */
  root: fileURLToPath(new URL('..', import.meta.url)),
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
        /* The translations: declarations rather than behaviour. */
        'src/shared/i18n/el/**',
        /* The data tables, likewise. */
        'src/features/island/world.ts',
        'src/features/interior/interiors.ts',
        'src/features/cv/cv.ts',
        'src/features/cv/cvHtml.ts',
        'src/features/cv/profile.ts',
        'src/features/npc/family.ts',
        'src/features/npc/audience.ts',
        'src/features/party/partyData.ts',
        'src/features/arcade/minigames.ts',
        /*
         * The scene: meshes and materials a headless run cannot render, and
         * whose logic has been pulled into the plain modules beside them.
         *
         * Listed one by one rather than matched by a path. These used to all
         * live under src/world and a single glob covered them; now each sits
         * in the feature it draws, and the only thing they still have in
         * common is being r3f. A blanket glob over every .tsx would be
         * shorter and wrong — it would also drop the six UI components that do
         * have tests, quietly flattering the number this file reports.
         */
        'src/shared/engine/Scene.tsx',
        'src/shared/engine/AdaptiveQuality.tsx',
        'src/shared/engine/TextSign.tsx',
        'src/shared/engine/Emblems.tsx',
        'src/features/island/{Island,Terrain,Water,Foliage,Paths,Props}.tsx',
        'src/features/island/{Daylight,NightLights,Buildings}.tsx',
        'src/features/island/buildings/**',
        'src/features/island/sea.ts',
        'src/features/interior/{Interior,InteriorProps}.tsx',
        'src/features/player/{Player,Character}.tsx',
        'src/features/npc/Npcs.tsx',
        'src/features/balloon/Balloon.tsx',
        'src/features/hide/Hide.tsx',
        'src/features/moto/Moto.tsx',
        'src/features/paintball/Paintball.tsx',
        'src/features/party/{Party,PartyButton}.tsx',
        'src/features/proposal/{Proposal,Amalia}.tsx',
        'src/features/rescue/{Boat,Swim}.tsx',
        'src/features/rescue/lifeboatHull.ts',
        'src/features/lecture/Slides.tsx',
        'src/features/arcade/GamesBoard.tsx',
        'src/features/cv/TechMarks.tsx',
        'src/main.tsx',
        'src/types.ts',
        'src/test/**',
        'src/**/*.d.ts',
      ],
    },
  },
})
