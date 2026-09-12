/**
 * Live positions of every character that moves, written by the NPC components
 * each frame and read by the player for collision and interaction. Keeping it
 * outside React means a strolling townsperson never triggers a re-render.
 */
export const ACTOR_POS = new Map<string, { x: number; z: number }>()

export function clearActors() {
  ACTOR_POS.clear()
}

/**
 * What lands on you decides what you do about it. A water bomb going off at
 * your feet is a thing to get away from; a cloud of confetti is not, and nor
 * is a motorcycle — until it is coming straight at you.
 */
export type Mood = 'cheer' | 'fright'

export interface Reaction {
  kind: Mood
  /** Seconds of it left. */
  left: number
  /** What it was — a fright needs something to run from. */
  x: number
  z: number
}

/**
 * Who is reacting to what, keyed by gathering id and by islander id. The two
 * sets of ids are hand-written and do not overlap. Read every frame by the
 * crowds and by <Npcs/>, which is why it lives out here rather than in React.
 *
 * It sits beside the positions rather than inside the balloon flight because
 * the race frightens people too, and neither game should have to import the
 * other to say so.
 */
export const REACTIONS = new Map<string, Reaction>()

/** Burns every reaction down and drops the ones that have run out. */
export function ageReactions(delta: number) {
  for (const [id, r] of REACTIONS) {
    r.left -= delta
    if (r.left <= 0) REACTIONS.delete(id)
  }
}
