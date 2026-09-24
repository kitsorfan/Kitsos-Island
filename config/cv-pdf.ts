/**
 * Prints the two-page CV to public/, as the PDF the island hands out.
 *
 *   npm run cv:pdf
 *
 * The PDF is committed rather than made during `npm run build`, because
 * making it takes a real browser and the build should not need one. So this
 * is run by hand whenever the CV changes, and the result checked in with it.
 *
 * Any Chromium will do — Edge, Chrome, Chromium, Brave. It finds the usual
 * installs by itself; point CV_BROWSER at anything else.
 *
 * A portrait at public/cv/photo.jpg goes into the header if it is there.
 */
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { RESUME_PDF } from '../src/features/cv/resume.ts'
import { buildResumeHtml } from '../src/features/cv/resumeHtml.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PHOTO = join(ROOT, 'public', 'cv', 'photo.jpg')
const OUT = join(ROOT, 'public', RESUME_PDF)

const CANDIDATES = [
  process.env.CV_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
]

const browser = CANDIDATES.find((p): p is string => !!p && existsSync(p))
if (!browser) {
  console.error('cv:pdf needs a Chromium browser; set CV_BROWSER to one.')
  process.exit(1)
}

// Inlined, so the render does not depend on where the temp file sits.
const photo = existsSync(PHOTO)
  ? `data:image/jpeg;base64,${readFileSync(PHOTO).toString('base64')}`
  : undefined

const dir = mkdtempSync(join(tmpdir(), 'cv-pdf-'))
try {
  const page = join(dir, 'cv.html')
  writeFileSync(page, buildResumeHtml({ photo, bare: true }))
  execFileSync(
    browser,
    [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      // Time for the web font to arrive before the page is printed.
      '--virtual-time-budget=10000',
      `--user-data-dir=${join(dir, 'profile')}`,
      `--print-to-pdf=${OUT}`,
      pathToFileURL(page).href,
    ],
    { stdio: 'ignore' },
  )
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log(`Wrote ${OUT}${photo ? '' : ' (no photo)'}`)
