/**
 * What the director and the recorder share.
 *
 * The cards are drawn by React but faded by the frame loop, which writes to
 * them straight, the same frame the picture under them was drawn in: a card
 * that waited for a render would land a frame late on every cut, and the
 * recorder would catch it doing so. So the cards hand their elements over
 * here, and the director reaches for them by name.
 */

/** The elements the director fades, by the name of the card. */
export const STAGE = {
  cards: new Map<string, HTMLElement>(),
  /** The black the trailer fades up out of and down into. */
  slate: null as HTMLElement | null,
}

export type Phase = 'warmup' | 'lead' | 'roll' | 'done'

/**
 * What the recorder reads after every frame it asks for. Updated in place
 * by the director, so reading it is one property lookup.
 */
export interface Tally {
  phase: Phase
  /** Whether the frame just drawn belongs in the trailer. */
  take: boolean
  /** Which frame of the trailer that was, counted from its first. */
  frame: number
  /** How many frames the trailer runs to. */
  total: number
  /** The shot on screen. */
  shot: string
  /** Every shot, and the frames it covers. */
  shots: { id: string; from: number; to: number }[]
  /** The soundtrack, as a base64 WAV, cut to the same bars as the pictures. */
  score: () => Promise<string>
}

/**
 * The clock the recorder runs the page on, when it is the recorder that
 * opened it. Its presence is how the director knows every frame is exactly
 * one sixtieth of a second, however long the machine took to draw it.
 */
export interface VirtualClock {
  advance: (ms: number) => void
}

declare global {
  interface Window {
    __trailer?: Tally
    __clock?: VirtualClock
  }
}
