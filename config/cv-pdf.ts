/**
 * Prints the two-page CV to public/, as the PDF the island hands out.
 *
 *   npm run cv:pdf
 *
 * The PDF is committed rather than made during `npm run build`, because
 * making it takes a real browser and the build should not need one. So this
 * is run by hand whenever the CV changes, and the result checked in with it.
 *
 * Any Chromium will do; see browser.ts for how it finds one.
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
import { findBrowser } from './browser.ts'
import { readResumeFont } from './resumeFont.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PHOTO = join(ROOT, 'public', 'cv', 'photo.jpg')
const OUT = join(ROOT, 'public', RESUME_PDF)

const browser = findBrowser('cv:pdf')

// Inlined, so the render does not depend on where the temp file sits.
const photo = existsSync(PHOTO)
  ? `data:image/jpeg;base64,${readFileSync(PHOTO).toString('base64')}`
  : undefined
const font = `data:font/woff2;base64,${readResumeFont().toString('base64')}`

const dir = mkdtempSync(join(tmpdir(), 'cv-pdf-'))
try {
  const page = join(dir, 'cv.html')
  writeFileSync(page, buildResumeHtml({ photo, font, bare: true }))
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
