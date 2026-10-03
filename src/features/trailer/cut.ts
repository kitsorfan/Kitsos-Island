import { BPM } from '../radio/music'

/**
 * The edit, measured in the music's own units.
 *
 * Every cut in the trailer lands on a bar line of the island's soundtrack,
 * which is what makes it read as cut to the music rather than laid over it.
 * Shots are measured in bars and the frames fall out of that, so changing
 * the length of one shot moves every cut after it and keeps them all on the
 * beat.
 */

/** Frames a second, recorded and played back. */
export const FPS = 60

/** One bar of the soundtrack, in seconds: four beats at its tempo. */
export const BAR = (4 * 60) / BPM

/** The frame a bar line falls on, to the nearest one. */
export const barFrame = (bar: number) => Math.round(bar * BAR * FPS)

/** A stretch of the trailer, in frames counted from its first. */
export interface Slot {
  from: number
  /** One past the last. */
  to: number
}

/**
 * Lays shots end to end. Each starts on the bar line the last one finished
 * on, and the rounding to a whole frame is done there, against the top of
 * the trailer, rather than shot by shot — so a long run of cuts never drifts
 * off the beat by a frame per shot.
 */
export function layout(bars: number[]): Slot[] {
  let at = 0
  return bars.map((length) => {
    const from = barFrame(at)
    at += length
    return { from, to: barFrame(at) }
  })
}

/** The slot a frame falls in, or -1 past the end of the last. */
export function slotAt(slots: Slot[], frame: number): number {
  return slots.findIndex((s) => frame >= s.from && frame < s.to)
}

/**
 * How much of a card is showing at a frame: rising over `rise` frames from
 * the start of its slot, held, and gone again over `fall` frames by the end
 * of it. Nothing outside the slot.
 */
export function presence(
  frame: number,
  slot: Slot,
  rise: number,
  fall: number,
): number {
  if (frame < slot.from || frame >= slot.to) return 0
  const up = rise > 0 ? (frame - slot.from + 1) / rise : 1
  const down = fall > 0 ? (slot.to - frame) / fall : 1
  return Math.max(0, Math.min(1, up, down))
}
