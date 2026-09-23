/**
 * The moment he works out what the lighthouse is.
 *
 * It plays once, on the doorstep, the first time the door is open and he
 * goes to step through it. He stops, a mark comes up over his head, the tower
 * sheds its paint in front of him and the rocket inside stands there for a
 * beat — and then the game lets him in.
 *
 * It exists because the reveal was arriving too late. The hologram on the
 * plinth is the reveal, and it is inside: you had to be standing on the
 * flight deck before the island admitted the lighthouse was a gantry, by
 * which point you had worked it out anyway. Putting it on the doorstep means
 * the last thing that happens outside is the surprise, and the first thing
 * that happens inside is a man who already knows.
 *
 * Everything here is arithmetic on one clock, like the launch: the mark, the
 * paint, the ship and the fade all read the same elapsed time, so nothing can
 * drift out of step with anything else.
 *
 * Named `revealLogic` rather than `reveal` because `Reveal.tsx` draws it, and
 * a file system that ignores case cannot tell the two apart — see the note in
 * the README about `balloonLogic.ts` beside `Balloon.tsx`.
 */

/** The stages of the reveal, in order. */
export type RevealStage =
  /** He stops dead and a mark comes up over his head. */
  | 'notice'
  /** The paint goes: the bands peel away and the shell thins out. */
  | 'shed'
  /** What was underneath, standing there. */
  | 'rocket'
  /** The screen goes, and the deck takes over. */
  | 'enter'

/** How long he stands there with the mark over him. */
export const NOTICE = 1.4

/**
 * How long the shell takes to come off.
 *
 * The longest stage by a distance, because it is the only one with anything
 * happening in it: six bands unlatching, lifting, turning and going. Rushed,
 * it reads as the tower glitching rather than opening.
 */
export const SHED = 2.9

/** How long the rocket holds, lit and ticking, before he goes in. */
export const ROCKET = 2.1

/** The fade into the building at the end of it. */
export const ENTER = 0.8

/** The whole thing, end to end. */
export const REVEAL_TOTAL = NOTICE + SHED + ROCKET + ENTER

const STARTS: { stage: RevealStage; at: number }[] = [
  { stage: 'notice', at: 0 },
  { stage: 'shed', at: NOTICE },
  { stage: 'rocket', at: NOTICE + SHED },
  { stage: 'enter', at: NOTICE + SHED + ROCKET },
]

export interface RevealPhase {
  stage: RevealStage
  /** 0 → 1 across the whole thing. */
  t: number
  /** 0 → 1 through the current stage alone. */
  stageT: number
  /** 0 → 1: how far up and how visible the mark over his head is. */
  mark: number
  /** 0 → 1: how far the painted shell has come off. 1 is gone. */
  shed: number
  /** 0 → 1: how much of the rocket is standing there. */
  ship: number
  /**
   * How hard the ground is shaking, 0 → 1.
   *
   * The tower does not come apart quietly. It peaks as the bands break away
   * and falls off through the rest, which is what carries the moment from
   * "an effect is playing" to "that just happened".
   */
  rumble: number
  /** 0 → 1: the glow at the seams as the shell splits, brightest mid-shed. */
  seam: number
  /** 0 → 1: the curtain at the end, 1 being black. */
  fade: number
  /** True once the whole thing has run and the door should open. */
  done: boolean
}

/** How many painted bands the tower wears. */
export const BANDS = 6

/**
 * How far band `i` has come away, 0 → 1, given the shed as a whole.
 *
 * They go one after another from the bottom up rather than all at once,
 * which is the whole difference between a tower coming apart and a texture
 * fading out. Each band gets the same share of the stage and they overlap,
 * so there is always more than one in the air.
 */
export function bandShed(i: number, shed: number): number {
  const each = 1 / (BANDS + 2)
  const from = i * each
  return Math.min(1, Math.max(0, (shed - from) / (each * 3)))
}

/** Smoothstep, for everything that should not start or stop abruptly. */
function ease(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/** Where the reveal is at `now`, in seconds on the clock it started on. */
export function revealPhase(
  reveal: { started: number },
  now: number,
): RevealPhase {
  const elapsed = Math.max(0, now - reveal.started)

  let index = 0
  for (let i = 0; i < STARTS.length; i++) {
    if (elapsed >= STARTS[i].at) index = i
  }
  const stage = STARTS[index].stage
  const from = STARTS[index].at
  const span = (STARTS[index + 1]?.at ?? REVEAL_TOTAL) - from
  const stageT = span > 0 ? Math.min(1, (elapsed - from) / span) : 1

  /*
   * The mark pops up fast and stays for the rest of it. It is the one thing
   * on screen that says "he has noticed", so it arrives before anything it
   * could be a reaction to — a mark that fades up alongside the reveal reads
   * as part of the scenery rather than as him.
   */
  const mark = stage === 'notice' ? ease(Math.min(1, stageT * 3)) : 1

  /* The paint comes off through its own stage and stays off. */
  const shed = stage === 'notice' ? 0 : stage === 'shed' ? ease(stageT) : 1

  /*
   * The ship fades up under the shell rather than after it, so for a moment
   * you can see both — which is what makes it read as one thing turning into
   * another instead of a swap.
   */
  const ship =
    stage === 'notice'
      ? 0
      : stage === 'shed'
        ? ease(Math.min(1, stageT * 1.4))
        : 1

  const fade = stage === 'enter' ? ease(stageT) : 0

  /*
   * The shake. Nothing while he is only looking, everything as the bands go,
   * and it thins out under the rocket - so the loudest moment of the whole
   * cutscene is the middle of it rather than the end.
   */
  const rumble =
    stage === 'shed'
      ? Math.sin(Math.min(1, stageT * 1.2) * Math.PI)
      : stage === 'rocket'
        ? Math.max(0, 0.35 - stageT * 0.35)
        : 0

  /* Light at the seams, up as they split and gone once the shell has. */
  const seam = stage === 'shed' ? Math.sin(stageT * Math.PI) : 0

  return {
    stage,
    t: Math.min(1, elapsed / REVEAL_TOTAL),
    stageT,
    mark,
    shed,
    ship,
    rumble,
    seam,
    fade,
    done: elapsed >= REVEAL_TOTAL,
  }
}

/** What he says to himself, one line per stage that has something to say. */
export const REVEAL_LINES: Partial<Record<RevealStage, string>> = {
  shed: 'Hang on.',
  rocket: 'This is not a lighthouse. This is a space rocket.',
}
