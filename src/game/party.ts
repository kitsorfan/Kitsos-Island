/**
 * The party in the plaza: where everyone stands, and what beat they are on.
 *
 * The beat comes from the soundtrack's own clock when it is playing, so the
 * crowd is dancing to the music rather than near it. With the music off it
 * falls back to a wall clock at the same tempo, and the party still works.
 */
import { DANCEFLOOR } from '../data/party'
import { BPM, musicBeats } from './music'

export const PARTY = {
  active: false,
  /** Seconds on the wall clock when it started, for the fallback beat. */
  from: 0,
  /** True once the player has walked into the middle and she is on her way. */
  called: false,
  /** Her descent, 0 in the sky to 1 on the floor. */
  entrance: 0,
}

/** How close to the middle of the floor you have to get to call her down. */
export const CALL_RADIUS = 2.5
/** How high she starts, and how long she takes to come down. */
export const SKY_HEIGHT = 30
export const DESCENT_SECONDS = 2.8

export const atCentre = (x: number, z: number) =>
  Math.hypot(x - DANCEFLOOR.x, z - DANCEFLOOR.z) < CALL_RADIUS

/** Called once, when the player reaches the middle. */
export function callAmalia() {
  if (PARTY.called) return
  PARTY.called = true
  PARTY.entrance = 0
}

/** Moves her descent on. Eased out, so she settles rather than lands. */
export function stepEntrance(delta: number) {
  if (!PARTY.called || PARTY.entrance >= 1) return
  PARTY.entrance = Math.min(1, PARTY.entrance + delta / DESCENT_SECONDS)
}

/** Her height above the floor at this point in the descent. */
export const entranceHeight = () =>
  SKY_HEIGHT * Math.pow(1 - PARTY.entrance, 2.4)

export function startParty() {
  PARTY.from = performance.now() / 1000
  PARTY.active = true
  PARTY.called = false
  PARTY.entrance = 0
}

export function stopParty() {
  PARTY.active = false
  PARTY.called = false
  PARTY.entrance = 0
}

/** Beats since the loop began. Fractional: 0.5 is halfway to the next one. */
export function partyBeat(): number {
  const fromMusic = musicBeats()
  if (fromMusic !== null) return fromMusic
  return (performance.now() / 1000 - PARTY.from) * (BPM / 60)
}

/**
 * Where one dancer stands: two rings facing in, so the floor fills from the
 * middle out and nobody ends up behind anybody. Deterministic, so a dancer
 * keeps the same spot for the whole party.
 */
export function danceSpot(index: number): { x: number; z: number } {
  const inner = index % 3 !== 2
  const ring = inner ? DANCEFLOOR.radius * 0.42 : DANCEFLOOR.radius * 0.76
  // Their seat is how many dancers before them are on the same ring, so two
  // of them never end up standing in the same place.
  let seat = 0
  for (let i = 0; i < index; i++) {
    if ((i % 3 !== 2) === inner) seat++
  }
  const count = inner ? 8 : 6
  const angle = (seat / count) * Math.PI * 2 + (inner ? 0.3 : 0.9)
  const wobble = ((index * 37) % 11) / 11 - 0.5
  return {
    x: DANCEFLOOR.x + Math.sin(angle) * (ring + wobble),
    z: DANCEFLOOR.z + Math.cos(angle) * (ring + wobble),
  }
}

/**
 * Where she stands to dance with him: an arm's length away, turning slowly
 * around him, which is what makes it a pair rather than two people dancing
 * near each other. If he walks off the floor she holds the middle instead.
 */
export function partnerSpot(
  px: number,
  pz: number,
  seconds: number,
): { x: number; z: number } {
  const withHim = onFloor(px, pz)
  const cx = withHim ? px : DANCEFLOOR.x
  const cz = withHim ? pz : DANCEFLOOR.z
  const turn = seconds * 0.34
  return {
    x: cx + Math.sin(turn) * PARTNER_GAP,
    z: cz + Math.cos(turn) * PARTNER_GAP,
  }
}

/** How far apart the two of them dance. */
export const PARTNER_GAP = 1.45

/** True while a point is on the floor, for anyone who wants to join in. */
export const onFloor = (x: number, z: number) =>
  Math.hypot(x - DANCEFLOOR.x, z - DANCEFLOOR.z) < DANCEFLOOR.radius
