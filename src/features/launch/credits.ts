import { PROFILE } from '../cv/profile'

/**
 * The credits that roll while he floats, once the engines are out.
 *
 * A game's credits, for a game that is one man's CV — so every role on the
 * list is the same person, and the joke is that the list is long anyway. It
 * is the one place on the island where the CV is allowed to be funny about
 * itself, and the last thing it does is stop being funny and say thank you.
 *
 * The roll runs once and finishes. It used to loop, which was wrong twice
 * over: a credits sequence that never ends is wallpaper rather than an
 * ending, and the certificate has to wait for something. Now it plays
 * through, the thanks hold, and the card comes up after.
 */

/** One card in the roll. */
export interface CreditCard {
  /**
   * What kind of card it is, which is what decides how it is drawn: the
   * opening title, a block of roles under one heading, or the thanks.
   */
  kind: 'title' | 'roles' | 'thanks'
  /** The heading over it — the department, or the title itself. */
  heading: string
  /** A line under the heading, on the title card only. */
  sub?: string
  /** The roles on this card, for a 'roles' card. */
  roles?: { role: string; who: string }[]
  /** The lines on the thanks card. */
  lines?: string[]
  /** How long this card holds, in seconds. */
  hold: number
}

const HIM = `${PROFILE.nickname} ${PROFILE.lastName}`

/**
 * The roll, in departments rather than one name at a time.
 *
 * Grouped because that is how credits actually read and because it is
 * funnier: a card headed "Engineering" with five jobs on it and the same
 * name beside every one lands better than the same name five times running.
 */
export const ROLL: CreditCard[] = [
  {
    kind: 'title',
    heading: 'Kitsos Island',
    sub: 'A playable CV',
    hold: 4.5,
  },
  {
    kind: 'roles',
    heading: 'Design',
    roles: [
      { role: 'Game Design', who: HIM },
      { role: 'Level Design', who: HIM },
      { role: 'Software Architecture', who: HIM },
    ],
    hold: 5,
  },
  {
    kind: 'roles',
    heading: 'Engineering',
    roles: [
      { role: 'Frontend', who: HIM },
      { role: 'Engine & Rendering', who: HIM },
      { role: 'Physics & Collision', who: HIM },
      { role: 'Terrain', who: 'One function, shared by everything' },
    ],
    hold: 5.5,
  },
  {
    kind: 'roles',
    heading: 'Art & Sound',
    roles: [
      { role: 'Character Art', who: `${HIM}, and a great many boxes` },
      { role: 'Lighting', who: HIM },
      { role: 'Original Soundtrack', who: `${HIM}, in code` },
    ],
    hold: 5,
  },
  {
    kind: 'roles',
    heading: 'Production',
    roles: [
      {
        role: 'Quality Assurance',
        who: 'A suite that will not be argued with',
      },
      { role: 'Chief Door Opener', who: 'A sensor in the Work District' },
      { role: 'Lift Timing Consultant', who: HIM },
      { role: 'Head of Vertical Transport', who: 'Also the lift' },
    ],
    hold: 5.5,
  },
  {
    kind: 'roles',
    heading: 'Also',
    roles: [
      { role: 'Rocket Science', who: `${HIM}, optimistically` },
      { role: 'Stunt Double', who: 'Him. There was no budget' },
      { role: 'Catering', who: 'The Christmas basement, once a year' },
      { role: 'Keeper of the Lighthouse', who: 'Vacant, as of today' },
    ],
    hold: 5.5,
  },
  {
    kind: 'roles',
    heading: 'Written, built and walked by',
    roles: [{ role: '', who: HIM }],
    hold: 4.5,
  },
  {
    kind: 'thanks',
    heading: 'Special thanks',
    lines: [
      'To Amalia, who said yes on the beach.',
      'To my family, for all of it.',
      'And to you, for walking the whole of it.',
    ],
    hold: 8,
  },
]

/** How long the whole roll takes, start to finish. */
export const ROLL_TOTAL = ROLL.reduce((sum, card) => sum + card.hold, 0)

/** Where each card begins, on the roll's own clock. */
const STARTS = ROLL.reduce<number[]>((at, _card, i) => {
  at.push(i === 0 ? 0 : at[i - 1] + ROLL[i - 1].hold)
  return at
}, [])

/**
 * Which card is showing at `elapsed` seconds into the roll, and how far
 * through it is.
 *
 * Returns null once the roll is over, which is the signal the certificate
 * waits on — so "the credits have finished" is one thing asked in one place
 * rather than a timer duplicated in the component.
 */
export function creditAt(
  elapsed: number,
): { card: CreditCard; index: number; t: number } | null {
  if (elapsed >= ROLL_TOTAL) return null
  const at = Math.max(0, elapsed)

  let index = 0
  for (let i = 0; i < STARTS.length; i++) {
    if (at >= STARTS[i]) index = i
  }
  const card = ROLL[index]
  return { card, index, t: (at - STARTS[index]) / card.hold }
}

/** True once the roll has played out and the card may come up. */
export const rollDone = (elapsed: number) => elapsed >= ROLL_TOTAL

/**
 * How opaque a card of age `t` is, 0 to 1.
 *
 * Up quickly, held, and out quickly. The hold is most of it: a card that is
 * fading for the whole time it is on screen is never actually readable, which
 * is the usual way a credits roll goes wrong.
 */
export function cardFade(t: number): number {
  if (t <= 0 || t >= 1) return 0
  const IN = 0.12
  const OUT = 0.88
  if (t < IN) return t / IN
  if (t > OUT) return (1 - t) / (1 - OUT)
  return 1
}

/**
 * How far a card has drifted upward, 0 at the bottom of its travel and 1 at
 * the top.
 *
 * Credits move. A card that fades in and out without going anywhere reads as
 * a slideshow, and the drift is what makes it a roll — slow, and only a
 * couple of centimetres of travel, because the text has to stay readable
 * while it happens.
 */
export const cardRise = (t: number) => Math.min(1, Math.max(0, t))
