import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The Greek arriving late.
 *
 * The dictionary is fetched rather than bundled, so there is a window — the
 * first paint, and however long the request takes — where the island is Greek
 * by preference but English in fact. What matters is that the window is
 * harmless: readable text throughout, and a clean switch when the words land.
 *
 * Each case imports the module fresh, because the dictionary is module state
 * and a test that ran before would otherwise have filled it in.
 */

/* A fresh module registry, so the dictionary starts empty as on a cold load. */
beforeEach(() => {
  vi.resetModules()
})

function freshI18n() {
  return import('./index')
}

describe('before the Greek has arrived', () => {
  it('reads as English rather than as blanks or raw keys', async () => {
    const { translator, localeReady } = await freshI18n()
    expect(localeReady('el')).toBe(false)

    /* The very thing a visitor would see mid-flight. */
    const el = translator('el')
    expect(el('Harbour')).toBe('Harbour')
    expect(el({ title: 'Harbour' })).toEqual({ title: 'Harbour' })
  })

  it('counts English as ready without fetching anything', async () => {
    const { localeReady } = await freshI18n()
    expect(localeReady('en')).toBe(true)
  })
})

describe('once the Greek has arrived', () => {
  it('translates what it now knows', async () => {
    const { translator, loadLocale, localeReady } = await freshI18n()
    const { EL } = await import('./el/index')
    const [english, greek] = Object.entries(EL)[0]

    const el = translator('el')
    /* Same translator across the wait: the island does not re-make one. */
    expect(el(english)).toBe(english)

    await loadLocale('el')
    expect(localeReady('el')).toBe(true)
    expect(el(english)).toBe(greek)
  })

  it('does not keep handing back the English it cached while waiting', async () => {
    // The memo is keyed on the source object, so a tree walked before the
    // words landed would otherwise stay English for the rest of the session.
    const { translator, loadLocale } = await freshI18n()
    const { EL } = await import('./el/index')
    const [english, greek] = Object.entries(EL)[0]

    const el = translator('el')
    const source = { title: english }
    expect(el(source).title).toBe(english)

    await loadLocale('el')
    expect(el(source).title).toBe(greek)
  })

  it('asks for it once however many ask at the same moment', async () => {
    const { loadLocale } = await freshI18n()
    /* Ten components mounting together must not be ten requests. */
    const all = await Promise.all(
      Array.from({ length: 10 }, () => loadLocale('el')),
    )
    expect(all).toHaveLength(10)
  })

  it('is a no-op once loaded, and for English always', async () => {
    const { loadLocale, localeReady } = await freshI18n()
    await loadLocale('el')
    await loadLocale('el')
    await loadLocale('en')
    expect(localeReady('el')).toBe(true)
  })
})
