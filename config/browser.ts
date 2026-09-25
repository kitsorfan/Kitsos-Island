/**
 * The Chromium the render scripts drive headless: cv:pdf and og:image.
 *
 * Any Chromium will do — Edge, Chrome, Chromium, Brave. It finds the usual
 * installs by itself; point CV_BROWSER at anything else.
 */
import { existsSync } from 'node:fs'

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

/** The first browser found, or an exit with a note on how to name one. */
export function findBrowser(script: string): string {
  const browser = CANDIDATES.find((p): p is string => !!p && existsSync(p))
  if (!browser) {
    console.error(`${script} needs a Chromium browser; set CV_BROWSER to one.`)
    process.exit(1)
  }
  return browser
}
