/**
 * Where he is and which way he is looking, as one live pair of objects.
 *
 * <Player/> writes both once a frame and everything else reads them: the
 * minimap, the NPCs deciding whether to turn and look, the vehicles putting
 * him back on his feet when he gets off. They sit out here rather than in
 * Player.tsx so that reading a position does not mean importing a component,
 * and so that the file holding the component exports only components.
 */
import { Vector3 } from 'three'
import { PLAYER_START } from '../island/world'

/** Live player position, read by NPCs and the minimap. */
export const PLAYER_POS = new Vector3(PLAYER_START[0], 0, PLAYER_START[1])

/** Live camera yaw, so the minimap can show which way you are facing. */
export const PLAYER_VIEW = { yaw: 0, facing: Math.PI }
