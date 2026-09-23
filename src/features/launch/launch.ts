/**
 * The launch: what the Old Lighthouse turns out to be, and how long it takes
 * to leave the island.
 *
 * The tower is a gantry and the summit room is a flight deck. Pressing the
 * button under the glass starts a sequence that cannot be stopped — the hold,
 * the burn, the climb, and then the quiet — and at the end of it he is in
 * orbit, the island is a shape below him, and there is a certificate with his
 * name on it waiting to be signed.
 *
 * Everything the sequence needs to be drawn, timed and tested lives here, so
 * the deck in the scene, the shake on the camera and the countdown over the
 * button are all reading off one clock. The rule this file exists to state:
 * a launch is one-way. There is no abort, and the island does not come back.
 */

/**
 * The room the ship is in. The lighthouse's own summit room: the same id the
 * building and its interior already carry, named here so the deck, the music
 * and the scene all point at one constant rather than at a repeated string.
 */
export const LAUNCH_AREA = 'lighthouse'

/**
 * The pressure suit, off its rack in the airlock.
 *
 * White with the island's own amber at the collar, so the man at the console
 * reads as dressed for the flight rather than as a townsman who wandered in.
 */
export const SPACESUIT = {
  skin: '#f0c39a',
  hair: '#3a2a1d',
  shirt: '#eef2f6',
  pants: '#e2e8ee',
} as const

/**
 * The shirt he brings home: blue with a yellow star, which is the only thing
 * anybody on the island can be seen to have earned.
 *
 * Kept here beside the suit because both are the flight's doing, and because
 * the greeting card's portrait reads the same table the player does.
 */
export const STAR_SHIRT = {
  skin: '#f0c39a',
  hair: '#3a2a1d',
  /* A deep flight blue rather than a bright one: the gold on it is what is
     meant to catch the eye, and a light blue swallows gold. */
  shirt: '#1b46a0',
  /* Trousers a shade under the gold of the star, so the two read as one kit
     rather than as a yellow that happens to be nearby. */
  pants: '#c99a1e',
} as const

/** The stages of a launch, in the order they run. */
export type LaunchStage =
  /** Strapped in, the count running down, the last moment to look away. */
  | 'hold'
  /** The engines light and the gantry lets go. */
  | 'ignition'
  /** Through the weather and out of the blue. */
  | 'climb'
  /** Engines out, the island a shape below, nothing but the hum. */
  | 'orbit'

/** How long the count holds before the engines light, in seconds. */
export const HOLD = 6

/** The burn: the loudest and shortest part of it. */
export const IGNITION = 3.5

/** The climb out, from the pad to the top of the sky. */
export const CLIMB = 9

/**
 * The whole sequence, end to end. `orbit` is not in it: the climb ends and
 * the quiet simply carries on for as long as he wants to float there.
 */
export const LAUNCH_TOTAL = HOLD + IGNITION + CLIMB

/** Where each stage begins, on the launch clock. */
const STARTS: { stage: LaunchStage; at: number }[] = [
  { stage: 'hold', at: 0 },
  { stage: 'ignition', at: HOLD },
  { stage: 'climb', at: HOLD + IGNITION },
  { stage: 'orbit', at: LAUNCH_TOTAL },
]

export interface LaunchPhase {
  stage: LaunchStage
  /** 0 → 1 across the whole sequence, 1 once he is in orbit. */
  t: number
  /** 0 → 1 through the current stage alone. */
  stageT: number
  /**
   * The number on the count, in whole seconds, while the hold runs: 6 down to
   * 1, then 0 for the rest of the flight. Rounded up rather than down, so the
   * count reads "1" for the whole of the last second and reaches zero exactly
   * when the engines light — a count that shows 0 for a second before
   * anything happens is a count that has already finished.
   */
  count: number
  /**
   * How hard the deck is shaking, 0 → 1. Nothing during the hold, everything
   * at ignition, and it falls away through the climb as the air thins.
   */
  shake: number
  /**
   * How far up the sky he is, 0 → 1: 0 on the pad, 1 in orbit. What the
   * starfield fades in over and the island shrinks against.
   */
  altitude: number
  /** True once the climb is over and the certificate can be signed. */
  arrived: boolean
}

/**
 * Smoothstep, so the climb eases off at the top rather than stopping dead
 * against the stars.
 */
function ease(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/**
 * Where a launch is at `now`, in seconds on the same clock it started on.
 *
 * Pure arithmetic on the elapsed time rather than a state machine stepped by
 * frames: a dropped frame or a backgrounded tab then costs nothing, because
 * the next frame reads the true time and draws where the rocket actually is
 * instead of where a counter got to.
 */
export function launchPhase(
  launch: { started: number },
  now: number,
): LaunchPhase {
  const elapsed = Math.max(0, now - launch.started)

  /* The last stage whose start has passed. */
  let index = 0
  for (let i = 0; i < STARTS.length; i++) {
    if (elapsed >= STARTS[i].at) index = i
  }
  const stage = STARTS[index].stage
  const from = STARTS[index].at
  const span = (STARTS[index + 1]?.at ?? LAUNCH_TOTAL) - from
  const stageT = span > 0 ? Math.min(1, (elapsed - from) / span) : 1

  /* The count runs through the hold and sits at zero ever after. */
  const count = elapsed < HOLD ? Math.ceil(HOLD - elapsed) : 0

  /* Still on the pad, then everything at once, then it thins out. */
  const shake =
    stage === 'hold'
      ? 0
      : stage === 'ignition'
        ? /* Snaps to full as the engines light rather than winding up to it:
             an ignition that ramps reads as a truck starting, not a rocket. */
          1
        : stage === 'climb'
          ? 1 - ease(stageT)
          : 0

  const altitude =
    stage === 'hold' || stage === 'ignition'
      ? 0
      : stage === 'climb'
        ? ease(stageT)
        : 1

  return {
    stage,
    t: Math.min(1, elapsed / LAUNCH_TOTAL),
    stageT,
    count,
    shake,
    altitude,
    arrived: elapsed >= LAUNCH_TOTAL,
  }
}

/** What the deck says at each stage, over the button. */
export const STAGE_LINES: Record<LaunchStage, string> = {
  hold: 'Hold. Strapped in and counting.',
  ignition: 'Ignition. The gantry has let go.',
  climb: 'Climbing. The island is getting smaller.',
  orbit: 'Orbit. Nothing out here but the hum.',
}
