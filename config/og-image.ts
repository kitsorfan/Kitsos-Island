/**
 * Draws the picture a link to the island unfurls with, in LinkedIn, Slack,
 * an email: public/og-image.png, 1200 × 630, the size they all crop to.
 *
 *   npm run og:image
 *
 * Committed rather than made during `npm run build`, like the PDF, because
 * it takes a real browser. Run it again when the name or the title changes.
 * Any Chromium will do; see browser.ts for how it finds one.
 *
 * The text comes from the CV data, and the island is drawn in the same
 * palette and typefaces as the site, so the preview reads as the place.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { NAME, PROFILE } from '../src/features/cv/profile.ts'
import { findBrowser } from './browser.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'public', 'og-image.png')
const WIDTH = 1200
const HEIGHT = 630

/** A font file from a @fontsource package, inlined for the temp page. */
const font = (spec: string) => {
  const file = fileURLToPath(import.meta.resolve(spec))
  return `data:font/woff2;base64,${readFileSync(file).toString('base64')}`
}

const face = (family: string, weight: number, spec: string) =>
  `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url("${font(spec)}") format("woff2"); }`

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The island: sand, a grassy hill, a palm, and the Old Lighthouse. */
const ISLAND = `
<svg class="island" viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="260" cy="360" rx="250" ry="46" fill="#5fb0d0" opacity=".55"/>
  <ellipse cx="260" cy="340" rx="230" ry="52" fill="#f3dca0" stroke="#2a2033" stroke-width="5"/>
  <path d="M70 336 C110 230 200 200 270 214 C350 228 420 262 450 336 Z" fill="#7cc36a" stroke="#2a2033" stroke-width="5" stroke-linejoin="round"/>
  <path d="M130 300 C170 262 230 250 290 262" fill="none" stroke="#5aa24e" stroke-width="6" stroke-linecap="round"/>
  <g stroke="#2a2033" stroke-width="5" stroke-linejoin="round">
    <path d="M330 250 L346 110 L378 110 L394 250 Z" fill="#fdf7e9"/>
    <path d="M338 180 L386 180 L390 214 L334 214 Z" fill="#e0524a"/>
    <path d="M343 130 L381 130 L384 152 L340 152 Z" fill="#e0524a"/>
    <rect x="334" y="86" width="56" height="26" rx="4" fill="#ffd45a"/>
    <path d="M328 88 L362 58 L396 88 Z" fill="#e0524a"/>
  </g>
  <g stroke="#2a2033" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M170 262 C176 220 180 190 196 150" fill="none" stroke-width="16"/>
    <path d="M170 262 C176 220 180 190 196 150" fill="none" stroke="#8a5a3b" stroke-width="7"/>
    <path d="M196 150 C170 132 140 136 120 152 C150 150 172 154 196 150 Z" fill="#4fa04a"/>
    <path d="M196 150 C214 124 246 120 268 132 C240 136 218 142 196 150 Z" fill="#4fa04a"/>
    <path d="M196 150 C180 118 184 96 200 80 C204 106 202 128 196 150 Z" fill="#4fa04a"/>
    <path d="M196 150 C222 150 244 164 252 186 C228 172 212 162 196 150 Z" fill="#4fa04a"/>
  </g>
</svg>`

const page = `<!doctype html>
<html><head><meta charset="UTF-8"><style>
${face('Baloo 2', 600, '@fontsource/baloo-2/files/baloo-2-latin-600-normal.woff2')}
${face('Baloo 2', 800, '@fontsource/baloo-2/files/baloo-2-latin-800-normal.woff2')}
${face('Press Start 2P', 400, '@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2')}
* { box-sizing: border-box; }
html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
body {
  position: relative;
  font-family: "Baloo 2", sans-serif;
  color: #241c2e;
  background: linear-gradient(#9ad7ee 0%, #7ec8e3 58%, #4aa6cf 58%, #3f94c0 100%);
}
.sun { position: absolute; left: 1010px; top: 50px; width: 110px; height: 110px; border-radius: 50%; background: #ffe58a; box-shadow: 0 0 0 18px #ffe58a55; }
.cloud { position: absolute; background: #fff; border-radius: 40px; opacity: .9; }
.island { position: absolute; right: 30px; bottom: 26px; width: 520px; }
.card {
  position: absolute; left: 64px; top: 72px; width: 640px;
  background: #fdf7e9; border: 5px solid #2a2033; border-radius: 22px;
  box-shadow: 0 9px 0 #2a2033, 0 28px 60px #17102055;
  padding: 40px 44px 36px;
}
.kicker { font-family: "Press Start 2P", monospace; font-size: 20px; color: #3f7bd6; letter-spacing: 1px; }
h1 { margin: 22px 0 8px; font-size: 58px; line-height: 1.02; font-weight: 800; }
.title { margin: 0; font-size: 28px; font-weight: 600; color: #574c68; line-height: 1.25; }
.footer { display: flex; gap: 14px; margin-top: 30px; align-items: center; }
.pill { font-weight: 800; font-size: 24px; padding: 8px 18px 6px; border: 4px solid #2a2033; border-radius: 14px; box-shadow: 0 5px 0 #2a2033; background: #ffd45a; }
.url { font-weight: 600; font-size: 24px; color: #241c2e; }
</style></head><body>
<div class="sun"></div>
<div class="cloud" style="left:760px;top:70px;width:170px;height:46px"></div>
<div class="cloud" style="left:820px;top:40px;width:90px;height:56px"></div>
<div class="cloud" style="left:980px;top:210px;width:140px;height:38px"></div>
${ISLAND}
<div class="card">
  <div class="kicker">KITSOS ISLAND</div>
  <h1>${esc(NAME)}</h1>
  <p class="title">${esc(PROFILE.title)}</p>
  <div class="footer">
    <span class="pill">A playable CV</span>
    <span class="url">${esc(PROFILE.websiteLabel)}</span>
  </div>
</div>
</body></html>`

const browser = findBrowser('og:image')
const dir = mkdtempSync(join(tmpdir(), 'og-image-'))
try {
  const file = join(dir, 'og.html')
  writeFileSync(file, page)
  execFileSync(
    browser,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${WIDTH},${HEIGHT}`,
      '--virtual-time-budget=5000',
      `--user-data-dir=${join(dir, 'profile')}`,
      `--screenshot=${OUT}`,
      pathToFileURL(file).href,
    ],
    { stdio: 'ignore' },
  )
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log(`Wrote ${OUT}`)
