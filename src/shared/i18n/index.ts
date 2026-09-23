import { useEffect, useMemo, useState } from 'react'

/**
 * Two languages, English first.
 *
 * Translations are keyed by the English source string rather than by an
 * invented id. The island's text lives in deeply nested data — panel sections,
 * dialogue trees, mission hints — and giving every leaf an id would have meant
 * restructuring all of it and keeping two shapes in step forever. Keying by the
 * English means the data files are never touched, and anything without a Greek
 * entry falls through and reads in English rather than showing a raw key.
 *
 * The same property makes it safe to walk a whole structure blindly: ids, hex
 * colours and URLs are not in the dictionary, so they come back untouched.
 */
export type Locale = 'en' | 'el'

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'el', label: 'Ελληνικά' },
]

export type Translate = <T>(value: T) => T

/**
 * Per-locale memo of everything already walked. Keyed on the source object, so
 * the static data tables are converted once and then handed back as-is — a
 * panel does not rebuild its sections on every frame it happens to re-render.
 */
const memo: Record<Locale, WeakMap<object, unknown>> = {
  en: new WeakMap(),
  el: new WeakMap(),
}

/**
 * The Greek dictionary, once it has arrived.
 *
 * It is a quarter of a megabyte of prose that most visitors never read, so it
 * is fetched on demand rather than shipped inside the island. Until it lands
 * this is empty, and an empty dictionary is not a broken one: every lookup
 * misses and falls through to the English, which is the same thing that
 * happens to any phrase nobody has translated yet. The island renders,
 * readably, and re-renders in Greek the moment the words are here.
 */
let EL: Record<string, string> = {}

/** The in-flight fetch, so that ten components asking at once make one request. */
let pending: Promise<void> | null = null

/** Bumped when the dictionary arrives, to wake the hooks waiting on it. */
let generation = 0
const listeners = new Set<() => void>()

/**
 * Fetch the Greek dictionary if it is not already here.
 *
 * Resolves immediately once loaded, so a caller may await it without caring
 * whether it is the first to ask. A failed fetch clears the promise rather
 * than caching the failure: the island stays in English, and the next attempt
 * — flicking the language back and forth, say — tries again rather than
 * inheriting a dead result.
 */
export function loadLocale(locale: Locale): Promise<void> {
  if (locale === 'en' || Object.keys(EL).length > 0) return Promise.resolve()
  if (!pending) {
    pending = import('./el/index')
      .then((m) => {
        EL = m.EL
        /* The misses cached before the words arrived are now wrong. */
        memo.el = new WeakMap()
        generation++
        for (const wake of listeners) wake()
      })
      .catch(() => {
        pending = null
      })
  }
  return pending
}

/** Whether the Greek is here yet. Exported for the tests. */
export function localeReady(locale: Locale): boolean {
  return locale === 'en' || Object.keys(EL).length > 0
}

function convert<T>(value: T, locale: Locale): T {
  if (locale === 'en') return value

  if (typeof value === 'string') return (EL[value] ?? value) as T
  if (value === null || typeof value !== 'object') return value

  const seen = memo[locale]
  const hit = seen.get(value as object)
  if (hit !== undefined) return hit as T

  let out: unknown
  if (Array.isArray(value)) {
    out = value.map((item) => convert(item, locale))
  } else {
    const copy: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as object)) {
      copy[key] = convert(item, locale)
    }
    out = copy
  }
  seen.set(value as object, out)
  return out as T
}

/**
 * Translate anything: a string, or a whole tree of them. Frozen source objects
 * are fine — the result is always a fresh copy, never a mutation in place.
 */
export function translator(locale: Locale): Translate {
  return <T>(value: T) => convert(value, locale)
}

export const EN: Translate = (value) => value

/**
 * The translator for a locale, fetching its dictionary if it is not here yet.
 *
 * Returns a working translator on the very first render rather than a promise
 * or a null: before the Greek arrives it reads as English, which is the same
 * fallback an untranslated phrase already gets. When the words land, every
 * hook re-renders and the island turns Greek in one pass.
 */
export function useTranslate(locale: Locale): Translate {
  const [, bump] = useState(0)

  useEffect(() => {
    if (locale === 'en' || localeReady(locale)) return
    let live = true
    const wake = () => {
      if (live) bump(generation)
    }
    listeners.add(wake)
    void loadLocale(locale)
    return () => {
      live = false
      listeners.delete(wake)
    }
  }, [locale])

  /* generation is read so the memo is rebuilt once the dictionary is in. */
  return useMemo(
    () => (locale === 'en' ? EN : translator(locale)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, generation],
  )
}
