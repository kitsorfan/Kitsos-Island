/**
 * The swim.
 *
 * Three quick taps of the jump key while he is standing over water — which
 * on this island means out on the jetty, and nowhere else — and the third
 * one takes him over the side. From there the walking leash is off: he swims
 * wherever there is water to swim in, and the moment the sand comes up under
 * him he wades out and carries on as though nothing had happened.
 *
 * Stepped once a frame by <Player/> and read by <SwimWake/>, so none of it
 * costs a React render.
 */
import { ISLAND_WALK_RADIUS } from '../island/world'
import { WATER_LEVEL, terrainHeight } from '../island/terrainLogic'
import { waveAt } from '../island/sea'
import { PLAYER_POS, PLAYER_VIEW } from '../player/playerLogic'
import type { Bounds } from '../../shared/engine/collision'

/** A steady breaststroke, and what he can manage going at it. */
export const SWIM_SPEED = 5.4
export const SWIM_SPRINT = 8.6

/** How deep he floats: the waterline crosses him at the chest. */
export const SINK = 1.15

/** The push he takes off the planks with, so he goes in clear of them. */
export const DIVE_SPRING = 2.6

/**
 * How much water it takes to swim in rather than stand in.
 *
 * Knee-deep, not out-of-your-depth: the shelf round this island is barely a
 * metre down until you are well past the jetty, so asking for water deep
 * enough to drown in would mean a sea nobody could ever swim in.
 */
export const WADE = 0.4

/**
 * How much of the sea is his. Out past the shelf the bottom falls away and
 * there is nothing but more water, so that is where he turns back.
 */
export const SWIM_RADIUS = 150

/** No island edge out here, and nothing in the water to bump into either. */
export const SWIM_BOUNDS: Bounds = { kind: 'circle', radius: SWIM_RADIUS }

/**
 * Near enough the middle of the island to be walking again. A shade inside
 * the walking edge, so the swim ends before that edge has anything to clamp.
 */
export const ASHORE = ISLAND_WALK_RADIUS - 0.5

export const SWIM = {
  /** True from going in to being back on the island on his own two feet. */
  active: false,
  /** True while he is off the bottom, rather than wading the last of it. */
  afloat: false,
  /** True between leaving the planks and hitting the water. */
  falling: false,
}

/** Where his feet ride while he is afloat: the sea, less how deep he sits. */
export const swimLine = (x: number, z: number, t: number) =>
  WATER_LEVEL + waveAt(x, z, t) - SINK

/** True where there is enough water to be swimming in rather than standing. */
export const deepEnough = (x: number, z: number) =>
  terrainHeight(x, z) < WATER_LEVEL - WADE

/**
 * True where there is sea under him at all: the sand is below the waterline,
 * so whatever he is standing on, he is standing over water. The half of the
 * jetty past the beach is the only such place he can walk to.
 */
export const overWater = (x: number, z: number) =>
  terrainHeight(x, z) < WATER_LEVEL

/**
 * Where his feet end up in the water at a given spot: riding the swell where
 * there is depth for it, and on the bottom where there is not. The dive and
 * the swim both measure off this, so a jump that goes in at the shallow end
 * lands standing in the shallows rather than somewhere under the sand.
 */
export const waterFloor = (x: number, z: number, t: number) =>
  deepEnough(x, z) ? swimLine(x, z, t) : terrainHeight(x, z)

export function diveIn() {
  SWIM.active = true
  SWIM.afloat = false
  SWIM.falling = true
}

/** Back on the island, on foot. Also how a teleport puts him right. */
export function dryOff() {
  SWIM.active = false
  SWIM.afloat = false
  SWIM.falling = false
}

/** Somebody in the water, as <SwimWake/> needs to see them to mark it. */
export interface Swimmer {
  x: number
  z: number
  /** Which way they are pointing, so the trail lies behind them. */
  facing: number
  /** False the moment they can stand up, which fades the whole sheet out. */
  afloat: boolean
}

/** The player, read off the live modules that keep him. */
const HIM: Swimmer = { x: 0, z: 0, facing: 0, afloat: false }
export function swimmingPlayer(): Swimmer {
  HIM.x = PLAYER_POS.x
  HIM.z = PLAYER_POS.z
  HIM.facing = PLAYER_VIEW.facing
  HIM.afloat = SWIM.afloat
  return HIM
}
