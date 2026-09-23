import { beforeAll, describe, expect, it } from 'vitest'
import { EN, LOCALES, loadLocale, localeReady, translator } from './index'
import { EL } from './el/index'

/**
 * Translation by English source string rather than by invented id.
 *
 * That choice is what makes it safe to hand a whole data structure over and
 * walk it blindly, and the properties worth holding it to all follow from it:
 * anything with no Greek entry reads in English rather than showing a raw key,
 * ids and hex colours and URLs are not in the dictionary so they come back
 * untouched, and the source object is never written to on the way through.
 */

const el = translator('el')

/*
 * The Greek is fetched on demand now rather than bundled, so a test that
 * asserts Greek has to wait for it exactly as the island does. Loading it
 * once here rather than per test keeps every case below synchronous, which
 * is also what they are checking: the translator itself never became async.
 */
beforeAll(() => loadLocale('el'))

/** An English phrase that really is in the Greek dictionary. */
const [KNOWN_EN, KNOWN_EL] = Object.entries(EL)[0]

describe('the locales on offer', () => {
  it('offers English and Greek, English first', () => {
    // The island is a CV before it is a game, and its audience is not only in
    // Greece, so Greek is a choice rather than a guess from the browser.
    expect(LOCALES.map((l) => l.id)).toEqual(['en', 'el'])
  })

  it('labels each one in its own language', () => {
    expect(LOCALES[0].label).toBe('English')
    expect(LOCALES[1].label).toBe('Ελληνικά')
  })
})

describe('the English translator', () => {
  it('hands everything straight back', () => {
    const source = { title: 'Hello', lines: ['one', 'two'] }
    expect(EN(source)).toBe(source)
    expect(EN('Hello')).toBe('Hello')
  })
})

describe('the Greek translator', () => {
  it('translates a string it knows', () => {
    expect(el(KNOWN_EN)).toBe(KNOWN_EL)
  })

  it('leaves a string it does not know in English', () => {
    // Better to read in English than to show a raw key to a visitor.
    const unknown = 'a sentence nobody has translated yet'
    expect(el(unknown)).toBe(unknown)
  })

  it('walks a whole tree of strings', () => {
    const source = { title: KNOWN_EN, nested: { lines: [KNOWN_EN] } }
    const out = el(source)
    expect(out.title).toBe(KNOWN_EL)
    expect(out.nested.lines[0]).toBe(KNOWN_EL)
  })

  it('never writes to the source it was given', () => {
    const source = { title: KNOWN_EN }
    const copy = { ...source }
    el(source)
    expect(source).toEqual(copy)
  })

  it('copies rather than mutating, so frozen data is fine', () => {
    const frozen = Object.freeze({ title: KNOWN_EN })
    expect(() => el(frozen)).not.toThrow()
    expect(el(frozen).title).toBe(KNOWN_EL)
    expect(frozen.title).toBe(KNOWN_EN)
  })

  it('keeps the shape of what it was handed', () => {
    const source = { a: ['x', 'y'], b: { c: 'z' } }
    const out = el(source)
    expect(Array.isArray(out.a)).toBe(true)
    expect(out.a).toHaveLength(2)
    expect(Object.keys(out)).toEqual(['a', 'b'])
  })

  it('leaves anything that is not a string alone', () => {
    const source = {
      count: 42,
      on: true,
      missing: null,
      nested: [1, 2, 3],
    }
    expect(el(source)).toEqual(source)
  })

  it('leaves ids, colours and links untouched', () => {
    // None of these are in the dictionary, which is exactly what makes it
    // safe to walk a structure without knowing which leaves are prose.
    const source = {
      id: 'lighthouse-lamp',
      accent: '#ff8c1a',
      href: 'https://example.com/cv',
    }
    expect(el(source)).toEqual(source)
  })

  it('hands back the very same conversion for the same source twice', () => {
    // The static data tables are converted once and then handed back as they
    // are, so a panel does not rebuild its sections on every re-render.
    const source = { title: KNOWN_EN }
    expect(el(source)).toBe(el(source))
  })

  it('keeps the two languages’ memos apart', () => {
    const source = { title: KNOWN_EN }
    expect(EN(source)).toBe(source)
    expect(el(source)).not.toBe(source)
  })
})

describe('the Greek dictionary, fetched on demand', () => {
  it('is not needed for English, which is always ready', () => {
    // An English visitor never pays for a dictionary they will not read.
    expect(localeReady('en')).toBe(true)
  })

  it('is here once it has been asked for', () => {
    expect(localeReady('el')).toBe(true)
  })

  it('has something to say', () => {
    expect(Object.keys(EL).length).toBeGreaterThan(0)
  })

  it('never translates a phrase into an empty string', () => {
    for (const [english, greek] of Object.entries(EL)) {
      expect(typeof greek, english).toBe('string')
      expect(greek.length, english).toBeGreaterThan(0)
    }
  })

  it('never has a key that is blank', () => {
    for (const english of Object.keys(EL)) {
      expect(english.length).toBeGreaterThan(0)
    }
  })
})
