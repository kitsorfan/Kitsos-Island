import { PROFILE } from '../cv/profile'

/**
 * The credits that roll while he floats, once the engines are out.
 *
 * A game's credits, for a game that is one man's CV — so every role on the
 * list is the same person, and the joke is that the list is long anyway. It
 * is the one place on the island where the CV is allowed to be funny about
 * itself, and the last thing it does is stop being funny and say thank you.
 */

export interface CreditRole {
  /** The job, as a game would print it. */
  role: string
  /** Who did it. Almost always him. */
  who: string
}

const HIM = `${PROFILE.nickname} ${PROFILE.lastName}`

/**
 * The roll. Ordered the way a real one is — the grand titles first, the
 * absurdly specific ones in the middle where they land best, and the honest
 * one last.
 */
export const CREDITS: CreditRole[] = [
  { role: 'Game Design', who: HIM },
  { role: 'Software Architecture', who: HIM },
  { role: 'Frontend Engineering', who: HIM },
  { role: 'Engine & Rendering', who: HIM },
  { role: 'Original Soundtrack', who: HIM },
  { role: 'Level Design', who: HIM },
  { role: 'Character Art', who: `${HIM}, and a lot of boxes` },
  { role: 'Lighting', who: HIM },
  { role: 'Quality Assurance', who: `${HIM} (638 tests, all passing)` },
  { role: 'Head of Terrain', who: 'One function, shared by everything' },
  { role: 'Lift Timing Consultant', who: HIM },
  { role: 'Chief Door Opener', who: 'A sensor in the Work District' },
  { role: 'Keeper of the Lighthouse', who: HIM },
  { role: 'Rocket Science', who: `${HIM}, optimistically` },
  { role: 'Catering', who: 'The Christmas basement, once a year' },
  { role: 'Stunt Double', who: 'Also him. There was no budget' },
  { role: 'Written, Built and Walked by', who: HIM },
]

/** The last card, which is the one that is not a joke. */
export const THANKS = {
  heading: 'Special thanks',
  lines: [
    'To Amalia, who said yes on the beach.',
    'To my family, for all of it.',
  ],
  /** Under everything, after the names. */
  sign: 'Thanks for walking the island.',
}

/** How long one credit sits on screen before the next, in seconds. */
export const PER_ROLE = 2.6

/** How long the thank-you card holds before the roll goes round again. */
export const THANKS_HOLD = 7

/**
 * The whole roll, end to end: every role, then the thanks.
 *
 * It loops rather than ending, because there is nothing after it — he is in
 * orbit and staying there until he chooses to fly home, so the credits are
 * something playing in the cabin rather than a door being held open.
 */
export const ROLL_TOTAL = CREDITS.length * PER_ROLE + THANKS_HOLD

/** Which card is showing at `elapsed` seconds into the roll. */
export function creditAt(elapsed: number): {
  /** The role on screen, or null while the thanks are up. */
  role: CreditRole | null
  /** True for the final card. */
  thanks: boolean
  /** 0 to 1 through whichever card is showing, for the fade. */
  t: number
} {
  const loop = ((elapsed % ROLL_TOTAL) + ROLL_TOTAL) % ROLL_TOTAL
  const rolls = CREDITS.length * PER_ROLE

  if (loop >= rolls) {
    return { role: null, thanks: true, t: (loop - rolls) / THANKS_HOLD }
  }
  const index = Math.floor(loop / PER_ROLE)
  return {
    role: CREDITS[index],
    thanks: false,
    t: (loop - index * PER_ROLE) / PER_ROLE,
  }
}

/**
 * How opaque a card of age `t` is, 0 to 1.
 *
 * Up quickly, held, and out quickly. The hold is most of it: a card that is
 * fading for the whole time it is on screen is never actually readable, which
 * is the usual way a credits roll goes wrong.
 */
export function cardFade(t: number): number {
  if (t <= 0 || t >= 1) return 0
  const IN = 0.15
  const OUT = 0.85
  if (t < IN) return t / IN
  if (t > OUT) return (1 - t) / (1 - OUT)
  return 1
}
