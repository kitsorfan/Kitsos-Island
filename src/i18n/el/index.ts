import { UI } from './ui'
import { WORLD } from './world'
import { INTERIORS } from './interiors'
import { PROFILE } from './profile'
import { FAMILY } from './family'
import { GAMES } from './games'

/**
 * The Greek dictionary, split by where its English comes from so that 900-odd
 * entries stay findable. The parts are merged once at module load; keys are
 * unique across them, and a later part would win a collision.
 */
export const EL: Record<string, string> = {
  ...UI,
  ...WORLD,
  ...INTERIORS,
  ...PROFILE,
  ...FAMILY,
  ...GAMES,
}
