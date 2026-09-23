/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { forgetProgress, isEmpty, loadProgress, saveProgress } from './save'
import type { SavedProgress } from './save'

/**
 * The save is the only thing on the island that has to survive being closed,
 * and the only thing a visitor can reach in and change. Two things are worth
 * holding it to: a visit written and read back is the same visit, and a blob
 * that has been edited, truncated or written by some older version of the
 * island is thrown away rather than half-read.
 *
 * Nothing here asserts the encoding itself. It is obfuscation and the file
 * says so; pinning the bytes would only make it painful to change something
 * that is deliberately allowed to change.
 */

const KEY = 'island.progress'

const blank: SavedProgress = {
  entries: [],
  keys: [],
  missions: {},
  discovered: [],
  secrets: [],
  lighthouseOpen: false,
  cvUnlocked: false,
  launched: false,
}

/** A visit with something in every field. */
const visit: SavedProgress = {
  entries: ['lighthouse-lamp', 'toy-helicopter', 'the-jetty'],
  keys: ['brass', 'basement'],
  missions: { 'find-the-lamp': 'done', 'walk-the-island': 'active' },
  discovered: ['harbour', 'work-district'],
  secrets: ['the-switch'],
  lighthouseOpen: true,
  cvUnlocked: true,
  launched: true,
}

beforeEach(() => {
  localStorage.clear()
})

describe('isEmpty', () => {
  it('knows a visit where nothing has happened yet', () => {
    expect(isEmpty(blank)).toBe(true)
  })

  it('counts each kind of progress on its own', () => {
    expect(isEmpty({ ...blank, entries: ['a'] })).toBe(false)
    expect(isEmpty({ ...blank, keys: ['a'] })).toBe(false)
    expect(isEmpty({ ...blank, discovered: ['a'] })).toBe(false)
    expect(isEmpty({ ...blank, secrets: ['a'] })).toBe(false)
    expect(isEmpty({ ...blank, missions: { m: 'active' } })).toBe(false)
    expect(isEmpty({ ...blank, lighthouseOpen: true })).toBe(false)
    expect(isEmpty({ ...blank, cvUnlocked: true })).toBe(false)
    expect(isEmpty({ ...blank, launched: true })).toBe(false)
  })
})

describe('a visit written and read back', () => {
  it('comes back as the same visit', () => {
    saveProgress(visit)
    expect(loadProgress()).toEqual(visit)
  })

  it('keeps the journal in the order it was found in', () => {
    saveProgress(visit)
    expect(loadProgress()?.entries).toEqual(visit.entries)
  })

  it('is not sitting in readable text in site data', () => {
    saveProgress(visit)
    const blob = localStorage.getItem(KEY) ?? ''
    expect(blob).not.toContain('lighthouse-lamp')
    expect(blob).not.toContain('the-switch')
    expect(blob.length).toBeGreaterThan(0)
  })

  it('salts every save, so the same visit twice is not the same string', () => {
    saveProgress(visit)
    const first = localStorage.getItem(KEY)
    saveProgress(visit)
    const second = localStorage.getItem(KEY)
    expect(second).not.toBe(first)
    // And both still read back as the visit they were.
    expect(loadProgress()).toEqual(visit)
  })

  it('replaces the previous save rather than adding to it', () => {
    saveProgress(visit)
    saveProgress({ ...visit, keys: ['brass'] })
    expect(loadProgress()?.keys).toEqual(['brass'])
  })
})

describe('a visit with nothing in it', () => {
  it('is not given a row in site data', () => {
    saveProgress(blank)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('clears a save that has been undone back to nothing', () => {
    saveProgress(visit)
    expect(localStorage.getItem(KEY)).not.toBeNull()
    saveProgress(blank)
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(loadProgress()).toBeNull()
  })
})

describe('loadProgress, when there is nothing good to load', () => {
  it('answers null on a first visit', () => {
    expect(loadProgress()).toBeNull()
  })

  it('answers null rather than throwing on a blob that is not base64', () => {
    localStorage.setItem(KEY, 'not a save at all !!!')
    expect(loadProgress()).toBeNull()
  })

  it('throws away a blob somebody edited', () => {
    saveProgress(visit)
    const blob = localStorage.getItem(KEY)!
    // Flip a character in the body. The checksum is what must catch this.
    const at = blob.length - 6
    const swapped = blob[at] === 'A' ? 'B' : 'A'
    localStorage.setItem(KEY, blob.slice(0, at) + swapped + blob.slice(at + 1))
    expect(loadProgress()).toBeNull()
  })

  it('throws away a blob that was truncated', () => {
    saveProgress(visit)
    const blob = localStorage.getItem(KEY)!
    localStorage.setItem(KEY, blob.slice(0, 6))
    expect(loadProgress()).toBeNull()
  })

  it('answers null rather than throwing when site data is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    expect(loadProgress()).toBeNull()
  })
})

describe('what a save is allowed to contain', () => {
  it('drops anything in a list that is not an id', () => {
    saveProgress({
      ...blank,
      entries: ['good', 42, null, { id: 'x' }] as unknown as string[],
    })
    expect(loadProgress()?.entries).toEqual(['good'])
  })

  it('keeps only the mission states the island has', () => {
    saveProgress({
      ...blank,
      missions: {
        real: 'done',
        also: 'active',
        // 'idle' is never written, and anything else was invented.
        idle: 'idle',
        nonsense: 'winner',
      } as unknown as SavedProgress['missions'],
    })
    expect(loadProgress()?.missions).toEqual({ real: 'done', also: 'active' })
  })

  it('takes a flag only when it is exactly true', () => {
    saveProgress({
      ...blank,
      entries: ['x'],
      lighthouseOpen: 'yes' as unknown as boolean,
      cvUnlocked: 1 as unknown as boolean,
      launched: 'true' as unknown as boolean,
    })
    const back = loadProgress()
    expect(back?.lighthouseOpen).toBe(false)
    expect(back?.cvUnlocked).toBe(false)
    expect(back?.launched).toBe(false)
  })

  it('reads a save written before the ship was found', () => {
    /*
     * The field was added without bumping VERSION, which is only safe while
     * a save that predates it still reads — as a visit that never launched,
     * with everything else it remembers intact.
     */
    const { launched: _launched, ...old } = visit
    saveProgress(old as unknown as SavedProgress)

    const back = loadProgress()
    expect(back?.launched).toBe(false)
    expect(back?.entries).toEqual(visit.entries)
    expect(back?.lighthouseOpen).toBe(true)
  })

  it('carries a journal long enough to be a real visit', () => {
    const many = Array.from({ length: 300 }, (_, i) => `entry-${i}`)
    saveProgress({ ...blank, entries: many })
    expect(loadProgress()?.entries).toEqual(many)
  })

  it('carries ids that are not plain ASCII', () => {
    const greek = ['φάρος', 'η-παραλία', '🎈']
    saveProgress({ ...blank, entries: greek })
    expect(loadProgress()?.entries).toEqual(greek)
  })
})

describe('forgetProgress', () => {
  it('clears the save', () => {
    saveProgress(visit)
    forgetProgress()
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(loadProgress()).toBeNull()
  })

  it('is quiet when there was nothing to clear', () => {
    expect(() => forgetProgress()).not.toThrow()
  })

  it('is quiet when site data cannot be reached at all', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    expect(() => forgetProgress()).not.toThrow()
  })
})

describe('saveProgress, when it cannot write', () => {
  it('does not interrupt the visit', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota')
    })
    expect(() => saveProgress(visit)).not.toThrow()
  })
})
