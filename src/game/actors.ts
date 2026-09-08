/**
 * Live positions of every character that moves, written by the NPC components
 * each frame and read by the player for collision and interaction. Keeping it
 * outside React means a strolling townsperson never triggers a re-render.
 */
export const ACTOR_POS = new Map<string, { x: number; z: number }>()

export function clearActors() {
  ACTOR_POS.clear()
}
