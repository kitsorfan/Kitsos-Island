/**
 * The director's hands: putting him somewhere, walking him there, and
 * pressing the buttons a player would.
 *
 * He is walked on the same stick a phone walks him on, so everything that
 * happens on the way — the collisions, the stride, the turn into each step —
 * is the game's own and not a puppet's.
 */
import { useGame } from '../../shared/state/store'
import {
  capeHold,
  liftHold,
  queueFire,
  queueInteract,
  queueJump,
  rideHold,
  sprintLock,
  touchStick,
  turnHold,
} from '../player/input'
import { PLAYER_POS, PLAYER_VIEW } from '../player/playerLogic'
import type { AreaId, Vec2 } from '../../types'

/** Puts him down somewhere at once: on the island, or in a room. */
export function put(area: AreaId, at: Vec2, facing?: number) {
  useGame.setState((s) => ({
    area,
    mode: 'explore',
    dialogue: null,
    panel: null,
    nearby: null,
    stride: null,
    spawn: {
      area,
      position: [at[0], at[1]],
      facing,
      token: s.spawn.token + 1,
    },
  }))
}

/** Hands off every control there is: the stick and all the buttons. */
export function release() {
  touchStick.x = 0
  touchStick.y = 0
  touchStick.active = false
  sprintLock.on = false
  turnHold.left = false
  turnHold.right = false
  liftHold.up = false
  liftHold.down = false
  capeHold.up = false
  capeHold.down = false
  for (const key of Object.keys(rideHold) as (keyof typeof rideHold)[]) {
    rideHold[key] = false
  }
}

/**
 * Everything one shot might have left running, stopped: a game, the
 * lighthouse coming apart, his own eyes, a conversation, the map. Each shot
 * then asks for what it wants from a clean island rather than from whatever
 * the last one happened to leave behind.
 */
export function reset() {
  release()
  const game = useGame.getState()
  if (game.moto) game.exitMoto()
  if (game.balloon) game.exitBalloon()
  if (game.paintball) game.exitPaintball()
  if (game.rescue) game.exitRescue()
  if (game.hide) game.exitHide()
  useGame.setState({
    reveal: null,
    firstPerson: false,
    mode: 'explore',
    dialogue: null,
    panel: null,
    toast: null,
  })
}

/** Day or night, and the party in the square or not, as a shot wants them. */
export function light(o: { night: boolean; party: boolean }) {
  const game = useGame.getState()
  if (game.party && !o.party) game.toggleParty()
  if (game.night !== o.night) useGame.getState().toggleNight()
  if (o.party && !useGame.getState().party) useGame.getState().toggleParty()
}

/**
 * Leans on the turn buttons until the camera faces a heading, in the yaw the
 * player's own camera uses. True once it does. The first-person shots are
 * aimed this way: behind his eyes, the lens looks where the yaw does.
 */
export function face(yaw: number) {
  let off = yaw - PLAYER_VIEW.yaw
  while (off > Math.PI) off -= Math.PI * 2
  while (off < -Math.PI) off += Math.PI * 2
  turnHold.left = off > 0.03
  turnHold.right = off < -0.03
  return !turnHold.left && !turnHold.right
}

/**
 * Leans on the stick towards a spot on the ground, at a fraction of full
 * tilt. True once he is within `near` of it.
 *
 * The stick is read against the camera's yaw, so a bearing on the ground has
 * to be turned into the stick's terms first — by the same rotation the player
 * applies, which happens to be its own inverse.
 */
export function steer(
  to: Vec2,
  o: { run?: boolean; pace?: number; near?: number } = {},
) {
  const dx = to[0] - PLAYER_POS.x
  const dz = to[1] - PLAYER_POS.z
  const d = Math.hypot(dx, dz)
  if (d < (o.near ?? 0.6)) return true
  const sin = Math.sin(PLAYER_VIEW.yaw)
  const cos = Math.cos(PLAYER_VIEW.yaw)
  const pace = o.pace ?? 1
  const wx = (dx / d) * pace
  const wz = (dz / d) * pace
  touchStick.x = cos * wx - sin * wz
  touchStick.y = -sin * wx - cos * wz
  touchStick.active = true
  sprintLock.on = o.run ?? false
  return false
}

/** Holds the stick at a tilt, for the games that read it as throttle and helm. */
export function stick(x: number, y: number) {
  touchStick.x = x
  touchStick.y = y
  touchStick.active = true
}

/** The director's scratch for one shot: where along a route he has got to. */
export interface Memo {
  leg?: number
  done?: Record<string, true>
}

/**
 * Walks him through a run of points, one after the other, and lets go of
 * the stick at the last. The corners are cut a little wide, as a person
 * walking them would.
 */
export function walk(
  memo: Memo,
  points: Vec2[],
  o: { run?: boolean; pace?: number } = {},
) {
  let leg = memo.leg ?? 0
  while (leg < points.length) {
    const last = leg === points.length - 1
    if (!steer(points[leg], { ...o, near: last ? 0.6 : 2 })) break
    leg++
  }
  memo.leg = leg
  if (leg >= points.length) release()
}

/** Does something once per shot, the first time its moment comes round. */
export function once(
  memo: Memo,
  id: string,
  at: number,
  now: number,
  fn: () => void,
) {
  if (now < at || memo.done?.[id]) return
  memo.done = { ...memo.done, [id]: true }
  fn()
}

/** The buttons, as a player presses them. */
export const press = {
  interact: queueInteract,
  jump: queueJump,
  fire: queueFire,
}

/** The held controls, for the games that are flown and ridden. */
export const hold = { ride: rideHold, lift: liftHold }
