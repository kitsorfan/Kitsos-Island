import { useCallback, useSyncExternalStore } from 'react'

/**
 * A phone, whichever way up it is held: narrow when it stands upright, short
 * when it lies on its side. Either way the HUD has room for a couple of
 * buttons and the island, and not for a corner full of cards as well.
 *
 * Measured off the viewport rather than the pointer on purpose. A tablet has
 * a coarse pointer and all the room in the world; a desktop window dragged
 * down to a sliver has a mouse and none.
 */
export const MOBILE_QUERY = '(max-width: 640px), (max-height: 500px)'

/** Taller than it is wide. */
export const PORTRAIT_QUERY = '(orientation: portrait)'

/**
 * Whether a media query matches, kept current as the window changes.
 *
 * Read synchronously on the first render rather than after it, so a phone
 * never paints one frame of the desktop HUD before it catches up.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** What kind of screen the island is on: a phone or not, upright or not. */
export function useScreen() {
  const mobile = useMediaQuery(MOBILE_QUERY)
  const portrait = useMediaQuery(PORTRAIT_QUERY)
  return { mobile, portrait }
}
