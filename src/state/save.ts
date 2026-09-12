/**
 * What the island remembers about a visit: the journal, the keyring, the
 * missions, and the doors that have been opened.
 *
 * It is kept encoded rather than as plain JSON. Nothing here is a secret the
 * page could actually keep — the seed below ships in the bundle, and anything
 * running on the page can undo this in a few lines — so this is obfuscation,
 * not encryption, and it is not where anything sensitive should ever go. What
 * it does buy is that the island's shape, its secret doors and the order they
 * were found in are not sitting in readable text in devtools or in whatever
 * else happens to read site data off this machine. Someone who wants to walk
 * the island should walk it.
 *
 * Only ids are saved. The journal's text lives in the data files and is
 * rebuilt from them on the way back in, so the blob stays small, stays in
 * whatever language is chosen on the day, and never carries a copy of the CV.
 */

const KEY = 'island.progress'

/** Bumped when the saved shape changes past what the reader below can take. */
const VERSION = 1

/** Mixed into every save's keystream. See the note above: not a secret. */
const SEED = 0x5ca1ab1e

export interface SavedProgress {
  /** Journal entry ids, in the order they were found. */
  entries: string[]
  keys: string[]
  /** Only the missions that have moved off 'idle'. */
  missions: Record<string, 'active' | 'done'>
  discovered: string[]
  secrets: string[]
  lighthouseOpen: boolean
  cvUnlocked: boolean
}

/**
 * One byte at a time out of mulberry32. Seeded per save from the salt, so two
 * saves of the same progress do not come out as the same string.
 */
function keystream(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) & 0xff
  }
}

/** FNV-1a, so a blob that was edited or truncated is thrown away, not read. */
function checksum(bytes: Uint8Array): number {
  let h = 0x811c9dc5
  for (const b of bytes) h = Math.imul(h ^ b, 0x01000193)
  return h >>> 0
}

function writeU32(into: Uint8Array, at: number, value: number) {
  into[at] = (value >>> 24) & 0xff
  into[at + 1] = (value >>> 16) & 0xff
  into[at + 2] = (value >>> 8) & 0xff
  into[at + 3] = value & 0xff
}

function readU32(from: Uint8Array, at: number): number {
  return (
    ((from[at] << 24) |
      (from[at + 1] << 16) |
      (from[at + 2] << 8) |
      from[at + 3]) >>>
    0
  )
}

/** [salt 4][checksum 4][text xor keystream], base64. */
function encode(text: string): string {
  const body = new TextEncoder().encode(text)
  const salt = (Math.random() * 0x100000000) >>> 0
  const next = keystream(salt ^ SEED)
  const out = new Uint8Array(body.length + 8)
  writeU32(out, 0, salt)
  writeU32(out, 4, checksum(body))
  for (let i = 0; i < body.length; i++) out[i + 8] = body[i] ^ next()

  let binary = ''
  for (const byte of out) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decode(blob: string): string | null {
  const binary = atob(blob)
  if (binary.length < 8) return null
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const next = keystream(readU32(bytes, 0) ^ SEED)
  const body = new Uint8Array(bytes.length - 8)
  for (let i = 0; i < body.length; i++) body[i] = bytes[i + 8] ^ next()
  if (checksum(body) !== readU32(bytes, 4)) return null
  return new TextDecoder().decode(body)
}

/** Anything that is not a list of strings comes back as an empty one. */
function ids(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function missionStates(value: unknown): Record<string, 'active' | 'done'> {
  const out: Record<string, 'active' | 'done'> = {}
  if (!value || typeof value !== 'object') return out
  for (const [id, state] of Object.entries(value)) {
    if (state === 'active' || state === 'done') out[id] = state
  }
  return out
}

/** Nothing done yet is not worth a row in site data. */
export function isEmpty(progress: SavedProgress): boolean {
  return (
    progress.entries.length === 0 &&
    progress.keys.length === 0 &&
    progress.discovered.length === 0 &&
    progress.secrets.length === 0 &&
    Object.keys(progress.missions).length === 0 &&
    !progress.lighthouseOpen &&
    !progress.cvUnlocked
  )
}

/**
 * A save from an earlier visit, or null — for no save, for a private window
 * that throws rather than answers, and for a blob that no longer reads. None
 * of those are a reason not to draw the island, so all three end the same way.
 */
export function loadProgress(): SavedProgress | null {
  try {
    const blob = localStorage.getItem(KEY)
    if (!blob) return null
    const text = decode(blob)
    if (!text) return null
    const saved = JSON.parse(text) as Record<string, unknown>
    if (saved.v !== VERSION) return null
    return {
      entries: ids(saved.entries),
      keys: ids(saved.keys),
      missions: missionStates(saved.missions),
      discovered: ids(saved.discovered),
      secrets: ids(saved.secrets),
      lighthouseOpen: saved.lighthouseOpen === true,
      cvUnlocked: saved.cvUnlocked === true,
    }
  } catch {
    return null
  }
}

export function saveProgress(progress: SavedProgress) {
  try {
    if (isEmpty(progress)) {
      localStorage.removeItem(KEY)
      return
    }
    localStorage.setItem(
      KEY,
      encode(JSON.stringify({ v: VERSION, ...progress })),
    )
  } catch {
    // Not being able to remember the visit is no reason to interrupt it.
  }
}

export function forgetProgress() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Already unreachable; there is nothing left to clear.
  }
}
