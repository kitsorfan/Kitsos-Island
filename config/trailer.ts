/**
 * Records the trailer: a minute of the island, cut to its own music.
 *
 *   npm run trailer                 # builds, records, writes trailer/kitsos-island-trailer.mp4
 *   npm run trailer -- --stills     # one picture from the middle of every shot, to check the cut
 *   npm run trailer -- --url http://localhost:5173   # record from a server already running
 *
 * The shots themselves are in src/features/trailer/shots.ts. Opening the
 * island at /?trailer plays them live in any browser, which is the quick way
 * to look at a change; this is the slow way, and the one that comes out
 * smooth.
 *
 * Smooth because the page is run on a clock of our own. Timers, animation
 * frames, `performance.now()`, the date and every CSS animation are all
 * stood still and stepped forward exactly a sixtieth of a second at a time,
 * and each frame is photographed before the next is asked for — so a frame
 * that took the machine half a second to draw is still a sixtieth long in
 * the film, and nothing on the island ever knows the difference.
 *
 * Needs a Chromium (see browser.ts) and ffmpeg (see ffmpeg.ts).
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findBrowser } from './browser.ts'
import { findFfmpeg } from './ffmpeg.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CONFIG = join(ROOT, 'config', 'vite.config.ts')
const FPS = 60
/** What comes out: full HD. */
const WIDTH = 1920
const HEIGHT = 1080
/**
 * What the page is laid out at: a laptop's worth of CSS pixels, drawn at one
 * and a half to the pixel. At a true 1920 the island's own interface — the
 * dialogue, the map, the toasts — shrinks to a corner of the frame, which is
 * not how anybody sees it; at this size it is.
 */
const VIEW = { width: 1280, height: 720, ratio: 1.5 }

/* ------------------------------- options ------------------------------- */

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(`--${name}`)
const option = (name: string) => {
  const at = argv.indexOf(`--${name}`)
  return at >= 0 ? argv[at + 1] : undefined
}

const STILLS = flag('stills')
const HEADED = flag('headed')
/** Drawn this many times over and shrunk back down: smoother edges, slower. */
const SCALE = Number(option('scale') ?? 1)
const OUT = option('out') ?? join(ROOT, 'trailer', 'kitsos-island-trailer.mp4')
const STILLS_DIR = join(ROOT, 'trailer', 'stills')

/* ------------------------------- the clock ----------------------------- */

/**
 * Put into the page before anything of its own runs. Everything that tells
 * the time is replaced with something that only moves when we say so.
 * Math.random is seeded too, so two recordings of the same cut are the same
 * film.
 */
const CLOCK = `(() => {
  const EPOCH = Date.UTC(2026, 5, 20, 9, 0, 0)
  let now = 0
  const RealDate = Date
  class VirtualDate extends RealDate {
    constructor(...args) { if (args.length) super(...args); else super(EPOCH + now) }
    static now() { return EPOCH + now }
  }
  globalThis.Date = VirtualDate
  performance.now = () => now

  let seed = 0x1517
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const call = (fn, args) => {
    try { typeof fn === 'function' ? fn(...args) : (0, eval)(String(fn)) }
    catch (e) { console.error(e) }
  }

  let ids = 0
  const timers = new Map()
  // While a frame's timers are running, one that asks to run again straight
  // away waits for the next frame: on a clock that only moves when it is
  // told to, a timeout that keeps setting itself for now never lets it.
  let until = -1
  const add = (fn, ms, args, every) => {
    const id = ++ids
    let at = now + Math.max(0, Number(ms) || 0)
    if (at <= until && !every) at = until + 0.001
    timers.set(id, { fn, args, at, every })
    return id
  }
  globalThis.setTimeout = (fn, ms, ...args) => add(fn, ms, args, 0)
  globalThis.setInterval = (fn, ms, ...args) => add(fn, ms, args, Math.max(1, Number(ms) || 0))
  globalThis.clearTimeout = globalThis.clearInterval = (id) => { timers.delete(id) }

  let frames = new Map()
  globalThis.requestAnimationFrame = (fn) => { const id = ++ids; frames.set(id, fn); return id }
  globalThis.cancelAnimationFrame = (id) => { frames.delete(id) }

  const held = new WeakSet()
  globalThis.__clock = {
    advance(ms) {
      until = now + ms
      for (;;) {
        let next = null
        for (const entry of timers) {
          if (entry[1].at <= until && (!next || entry[1].at < next[1].at)) next = entry
        }
        if (!next) break
        const [id, timer] = next
        now = Math.max(now, timer.at)
        if (timer.every) timer.at += timer.every
        else timers.delete(id)
        call(timer.fn, timer.args)
      }
      now = until
      until = -1
      // CSS animations and transitions run on the compositor's clock, so
      // each is caught the first time it shows up and wound on by hand.
      for (const animation of document.getAnimations()) {
        if (!held.has(animation)) {
          held.add(animation)
          animation.pause()
          animation.currentTime = 0
        } else {
          animation.currentTime = (Number(animation.currentTime) || 0) + ms
        }
      }
      const due = frames
      frames = new Map()
      for (const fn of due.values()) call(fn, [now])
    },
  }
})()`

/* ------------------------------ devtools ------------------------------- */

type Params = Record<string, unknown>

/** How long any one request to the browser may take. */
const PATIENCE = 90_000

interface Devtools {
  send: <T = Params>(method: string, params?: Params) => Promise<T>
  on: (event: string, fn: (params: Params) => void) => void
  close: () => void
}

async function connect(url: string): Promise<Devtools> {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  let next = 0
  const waiting = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >()
  const listeners = new Map<string, ((params: Params) => void)[]>()
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(String(event.data))
    if (msg.id !== undefined) {
      const call = waiting.get(msg.id)
      waiting.delete(msg.id)
      if (msg.error) call?.reject(new Error(msg.error.message))
      else call?.resolve(msg.result)
    } else {
      for (const fn of listeners.get(msg.method) ?? []) fn(msg.params)
    }
  })
  ws.addEventListener('close', () => {
    for (const call of waiting.values()) call.reject(new Error('closed'))
  })
  return {
    send: <T>(method: string, params: Params = {}) =>
      new Promise<T>((resolve, reject) => {
        const id = ++next
        // A page that has stopped answering says so, rather than leaving the
        // recording waiting on it for ever.
        const timer = setTimeout(() => {
          waiting.delete(id)
          reject(new Error(`${method} got no answer in ${PATIENCE / 1000}s.`))
        }, PATIENCE)
        waiting.set(id, {
          resolve: (v) => {
            clearTimeout(timer)
            resolve(v as T)
          },
          reject: (e) => {
            clearTimeout(timer)
            reject(e)
          },
        })
        ws.send(JSON.stringify({ id, method, params }))
      }),
    on: (event, fn) =>
      listeners.set(event, [...(listeners.get(event) ?? []), fn]),
    close: () => ws.close(),
  }
}

/** Runs an expression in the page and hands back its value. */
async function evaluate<T>(page: Devtools, expression: string, wait = false) {
  const { result, exceptionDetails } = await page.send<{
    result: { value: T }
    exceptionDetails?: { exception?: { description?: string }; text: string }
  }>('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: wait,
  })
  if (exceptionDetails) {
    throw new Error(
      exceptionDetails.exception?.description ?? exceptionDetails.text,
    )
  }
  return result.value
}

/* ------------------------------- the tools ----------------------------- */

/** The island, built and served from a folder of its own; or the one given. */
async function serve(): Promise<{ url: string; close: () => Promise<void> }> {
  const given = option('url')
  if (given) return { url: given, close: async () => {} }

  const { build, preview } = await import('vite')
  const outDir = mkdtempSync(join(tmpdir(), 'trailer-build-'))
  console.log('Building the island…')
  await build({
    configFile: CONFIG,
    logLevel: 'warn',
    build: { outDir, emptyOutDir: true },
  })
  const server = await preview({
    configFile: CONFIG,
    logLevel: 'warn',
    build: { outDir },
    preview: { port: 4317, strictPort: false, open: false },
  })
  const url = server.resolvedUrls?.local[0]
  if (!url) throw new Error('The preview server gave no address.')
  return {
    url,
    close: async () => {
      await server.close()
      rmSync(outDir, { recursive: true, force: true })
    },
  }
}

async function launch(browser: string, profile: string) {
  const args = [
    ...(HEADED ? [] : ['--headless=new']),
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--mute-audio',
    `--window-size=${VIEW.width},${VIEW.height}`,
    '--force-device-scale-factor=1',
    // A real GPU, not the software rasteriser headless falls back to.
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    // Nothing on this page is ever in the background, whatever the OS thinks.
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    'about:blank',
  ]
  const child = spawn(browser, args, { stdio: 'ignore' })
  const portFile = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 200 && !existsSync(portFile); i++) {
    await new Promise((r) => setTimeout(r, 100))
  }
  if (!existsSync(portFile)) throw new Error('The browser never opened a port.')
  const [port] = readFileSync(portFile, 'utf8').split('\n')
  const targets = (await (
    await fetch(`http://127.0.0.1:${port}/json/list`)
  ).json()) as { type: string; webSocketDebuggerUrl: string }[]
  const target = targets.find((t) => t.type === 'page')
  if (!target) throw new Error('The browser opened no page.')
  return { child, page: await connect(target.webSocketDebuggerUrl) }
}

/* ------------------------------- recording ----------------------------- */

interface Step {
  take: boolean
  frame: number
  phase: string
  shot: string
}

const STEP = `(() => {
  __clock.advance(${1000 / FPS})
  const t = window.__trailer
  return t ? { take: t.take, frame: t.frame, phase: t.phase, shot: t.shot } : { take: false, frame: -1, phase: 'loading', shot: '' }
})()`

const seconds = (frames: number) => (frames / FPS).toFixed(2)

async function record() {
  const browser = findBrowser('trailer')
  const ffmpeg = STILLS ? '' : findFfmpeg('trailer')
  const site = await serve()
  const profile = mkdtempSync(join(tmpdir(), 'trailer-profile-'))
  const { child, page } = await launch(browser, profile)

  try {
    page.on('Runtime.exceptionThrown', (p) => {
      const details = p.exceptionDetails as {
        exception?: { description?: string }
        text: string
      }
      console.error('[page]', details.exception?.description ?? details.text)
    })
    page.on('Runtime.consoleAPICalled', (p) => {
      if (p.type !== 'error') return
      const args = p.args as { value?: unknown; description?: string }[]
      console.error('[page]', ...args.map((a) => a.value ?? a.description))
    })
    await page.send('Runtime.enable')
    await page.send('Page.enable')
    await page.send('Emulation.setDeviceMetricsOverride', {
      width: VIEW.width,
      height: VIEW.height,
      deviceScaleFactor: VIEW.ratio * SCALE,
      mobile: false,
    })
    await page.send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK })
    const url = new URL(site.url)
    url.searchParams.set('trailer', '')
    console.log(`Opening ${url.href}`)
    await page.send('Page.navigate', { url: url.href })

    // Wind the clock while the island loads, until the director has it.
    const started = Date.now()
    let step: Step = { take: false, frame: -1, phase: 'loading', shot: '' }
    for (;;) {
      try {
        step = await evaluate<Step>(page, STEP)
      } catch {
        // The page is still between documents; ask again in a moment.
        await new Promise((r) => setTimeout(r, 100))
      }
      if (step.phase !== 'loading' && step.phase !== 'warmup') break
      if (Date.now() - started > 120_000) {
        throw new Error(`The island never got going (stuck at ${step.phase}).`)
      }
    }
    const { total, shots } = await evaluate<{
      total: number
      shots: { id: string; from: number; to: number }[]
    }>(page, '({ total: __trailer.total, shots: __trailer.shots })')
    console.log(`${shots.length} shots, ${total} frames, ${seconds(total)}s`)

    let encoder: ReturnType<typeof spawn> | null = null
    const work = mkdtempSync(join(tmpdir(), 'trailer-'))
    /** For the stills: the frames to keep, and what to call each. */
    const wants = new Map<number, string>()
    if (STILLS) {
      rmSync(STILLS_DIR, { recursive: true, force: true })
      mkdirSync(STILLS_DIR, { recursive: true })
      shots.forEach((s, i) => {
        const name = `${String(i + 1).padStart(2, '0')}-${s.id}`
        // Near the start, the middle, and the very last frame — the one the
        // cut lands on — which is enough to see what a move does without
        // watching it.
        wants.set(Math.floor(s.from + (s.to - s.from) * 0.1), `${name}-a`)
        wants.set(Math.floor((s.from + s.to) / 2), `${name}-b`)
        wants.set(s.to - 1, `${name}-c`)
      })
    } else {
      console.log('Rendering the score…')
      const score = join(work, 'score.wav')
      const audio = await evaluate<string>(page, '__trailer.score()', true)
      writeFileSync(score, Buffer.from(audio, 'base64'))
      mkdirSync(join(OUT, '..'), { recursive: true })
      const length = total / FPS
      encoder = spawn(
        ffmpeg,
        [
          ...['-y', '-loglevel', 'error'],
          ...['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png'],
          ...['-i', '-', '-i', score],
          ...(SCALE !== 1
            ? ['-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos`]
            : []),
          '-af',
          `loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=${(length - 2.5).toFixed(3)}:d=2.5`,
          ...['-map', '0:v', '-map', '1:a'],
          ...['-c:v', 'libx264', '-preset', 'slow', '-crf', '16'],
          ...['-profile:v', 'high', '-pix_fmt', 'yuv420p'],
          ...['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'],
          ...['-t', length.toFixed(3), '-movflags', '+faststart'],
          OUT,
        ],
        { stdio: ['pipe', 'inherit', 'inherit'] },
      )
    }

    let expected = 0
    let shot = ''
    const rolling = Date.now()
    for (;;) {
      if (step.take) {
        if (step.frame !== expected) {
          console.warn(`  frame ${step.frame} where ${expected} was expected`)
        }
        expected = step.frame + 1
        if (step.shot !== shot) {
          shot = step.shot
          const at = shots.findIndex((s) => s.id === shot)
          const elapsed = (Date.now() - rolling) / 1000
          const left =
            step.frame > 0 ? (elapsed / step.frame) * (total - step.frame) : 0
          console.log(
            `  ${String(at + 1).padStart(2)}/${shots.length} ${shot.padEnd(22)} ${seconds(step.frame)}s` +
              (left ? `   ~${Math.ceil(left / 60)} min to go` : ''),
          )
        }
        if (encoder || wants.has(step.frame)) {
          const { data } = await page.send<{ data: string }>(
            'Page.captureScreenshot',
            { format: 'png', optimizeForSpeed: !STILLS },
          )
          const png = Buffer.from(data, 'base64')
          if (encoder) {
            if (!encoder.stdin!.write(png)) await once(encoder.stdin!, 'drain')
          } else {
            writeFileSync(join(STILLS_DIR, `${wants.get(step.frame)}.png`), png)
          }
        }
      }
      if (step.phase === 'done') break
      step = await evaluate<Step>(page, STEP)
    }

    if (encoder) {
      encoder.stdin!.end()
      const [code] = await once(encoder, 'exit')
      if (code !== 0) throw new Error(`ffmpeg stopped with ${code}.`)
      console.log(`Wrote ${OUT}`)
    } else {
      console.log(`Wrote ${wants.size} stills to ${STILLS_DIR}`)
    }
    rmSync(work, { recursive: true, force: true })
  } finally {
    page.close()
    child.kill()
    await site.close()
    // The browser takes a moment to let go of its profile on Windows.
    await new Promise((r) => setTimeout(r, 500))
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 })
  }
}

await record()
