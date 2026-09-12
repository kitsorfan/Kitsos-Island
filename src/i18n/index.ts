import { useMemo } from 'react'
import { EL } from './el/index'

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

export function useTranslate(locale: Locale): Translate {
  return useMemo(() => (locale === 'en' ? EN : translator(locale)), [locale])
}
