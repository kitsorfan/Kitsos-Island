import { vi } from 'vitest'
import { MOBILE_QUERY, PORTRAIT_QUERY } from '../shared/ui/useScreen'

type Screen = { mobile?: boolean; portrait?: boolean; coarse?: boolean }

/**
 * Put the page on a given kind of screen.
 *
 * The setup file answers "no" to every media query, which is a desktop. This
 * answers the island's own questions — a phone, upright, a finger for a
 * pointer — however the test says, and keeps the listeners, so that `turn`
 * can change the screen under a rendered component the way rotating a phone
 * does. Whatever it was not asked about still answers "no".
 *
 * A spy, so the afterEach in setup puts the desktop back.
 */
export function fakeScreen(initial: Screen) {
  const screen = { ...initial }
  const listeners = new Set<() => void>()

  const matches = (query: string) =>
    query === MOBILE_QUERY
      ? Boolean(screen.mobile)
      : query === PORTRAIT_QUERY
        ? Boolean(screen.portrait)
        : query === '(pointer: coarse)'
          ? Boolean(screen.coarse)
          : false

  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return matches(query)
        },
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_: string, listener: () => void) =>
          listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) =>
          listeners.delete(listener),
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  )

  return {
    /** Change the screen, and tell everyone listening that it changed. */
    turn(next: Screen) {
      Object.assign(screen, next)
      for (const listener of listeners) listener()
    },
  }
}
