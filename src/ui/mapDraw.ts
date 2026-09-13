import {
  BUILDINGS,
  ISLAND_FLAT_RADIUS,
  NPCS,
  PATHS,
  PLAZA_RADIUS,
} from '../data/world'
import { HILLS } from '../game/terrain'
import { ACTOR_POS } from '../game/actors'
import { ARENA, PAINT } from '../game/paintball'
import { MOTO, pointAt } from '../game/moto'
import { BALLOON, CALLS, PAYLOAD_COLOR } from '../game/balloon'
import { BEACH, LAST_GASP, RESCUE } from '../game/rescue'
import { HIDE } from '../game/hide'
import { PLAYER_POS, PLAYER_VIEW } from '../game/player'

/** Half the world width the map shows, in world units. */
export const MAP_RADIUS = 132

const NPC_BY_ID = new Map(NPCS.map((n) => [n.id, n]))

const SEA = '#3f93c4'
const SHALLOW = '#63bcd8'
const SAND = '#e6d5a6'
const GRASS = '#79b64e'
const GRASS_DARK = '#5f9c3e'
const PATH = '#dcc394'
const INK = '#2a2033'

export interface MapOptions {
  size: number
  discovered: Record<string, true>
  /** Building the current objective points at. */
  objective?: string | null
  labels?: boolean
  /** Draw people as dots. */
  people?: boolean
}

export function worldToMap(x: number, z: number, size: number) {
  const k = size / 2 / MAP_RADIUS
  return [size / 2 + x * k, size / 2 + z * k] as const
}

export function drawMap(ctx: CanvasRenderingContext2D, opts: MapOptions): void {
  const { size } = opts
  const k = size / 2 / MAP_RADIUS
  const cx = size / 2
  const cy = size / 2
  const px = (x: number) => cx + x * k
  const py = (z: number) => cy + z * k

  ctx.clearRect(0, 0, size, size)

  // Sea, then the shelf, then the island.
  ctx.fillStyle = SEA
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = SHALLOW
  ctx.beginPath()
  ctx.arc(cx, cy, 130 * k, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = SAND
  ctx.beginPath()
  ctx.arc(cx, cy, 122 * k, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = GRASS
  ctx.beginPath()
  ctx.arc(cx, cy, ISLAND_FLAT_RADIUS * k, 0, Math.PI * 2)
  ctx.fill()

  // Hills
  ctx.fillStyle = GRASS_DARK
  for (const hill of HILLS) {
    ctx.beginPath()
    ctx.arc(
      px(hill.position[0]),
      py(hill.position[1]),
      hill.radius * k,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }

  // Roads
  ctx.strokeStyle = PATH
  ctx.lineWidth = Math.max(1.5, 5 * k)
  ctx.lineCap = 'round'
  for (const [a, b] of PATHS) {
    ctx.beginPath()
    ctx.moveTo(px(a[0]), py(a[1]))
    ctx.lineTo(px(b[0]), py(b[1]))
    ctx.stroke()
  }

  // Plaza
  ctx.fillStyle = '#e8d8b2'
  ctx.beginPath()
  ctx.arc(cx, cy, PLAZA_RADIUS * k, 0, Math.PI * 2)
  ctx.fill()

  // Buildings
  for (const b of BUILDINGS) {
    const found = opts.discovered[b.id]
    const w = b.half[0] * 2 * k
    const h = b.half[1] * 2 * k
    const x = px(b.position[0]) - w / 2
    const y = py(b.position[1]) - h / 2

    ctx.fillStyle = found ? b.accent : '#8a8f94'
    ctx.globalAlpha = found ? 1 : 0.55
    ctx.fillRect(x, y, w, h)
    ctx.globalAlpha = 1
    ctx.strokeStyle = INK
    ctx.lineWidth = Math.max(1, 1.6 * k * 3)
    ctx.strokeRect(x, y, w, h)

    if (opts.objective === b.id) {
      ctx.strokeStyle = '#ffd166'
      ctx.lineWidth = Math.max(2, 3 * k * 3)
      ctx.beginPath()
      ctx.arc(
        px(b.position[0]),
        py(b.position[1]),
        Math.max(w, h) * 0.9,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
    }
  }

  // The rest of the grid, and the line they are all racing back to.
  if (MOTO.active) {
    const line = pointAt(0)
    ctx.fillStyle = '#f7f7f4'
    ctx.strokeStyle = INK
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(px(line.x), py(line.z), Math.max(3, 2.2 * k * 2), 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    for (const rival of MOTO.rivals) {
      ctx.fillStyle = rival.bike
      ctx.beginPath()
      ctx.arc(
        px(rival.x),
        py(rival.z),
        Math.max(2.5, 2 * k * 2),
        0,
        Math.PI * 2,
      )
      ctx.fill()
      ctx.stroke()
    }
  }

  // The rafts, while a rescue is on: the shoreline she has to stay off, and
  // a mark for every flare still burning, reddening as it runs out.
  if (RESCUE.active) {
    ctx.strokeStyle = '#8fb8d0'
    ctx.lineWidth = Math.max(1, 1.4 * k * 2)
    ctx.beginPath()
    ctx.arc(px(0), py(0), BEACH * k, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = INK
    ctx.lineWidth = 1
    for (const soul of RESCUE.people) {
      ctx.fillStyle = soul.burn < LAST_GASP ? '#e63c58' : '#f0a33c'
      ctx.beginPath()
      ctx.arc(px(soul.x), py(soul.z), Math.max(3, 2.4 * k * 2), 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }

  // Gatherings still waiting, while a flight is on: a ring in the colour of
  // whatever they asked for.
  if (BALLOON.active) {
    ctx.lineWidth = Math.max(1, 1.2 * k * 2)
    for (const call of CALLS) {
      if (BALLOON.served[call.id]) continue
      ctx.fillStyle = PAYLOAD_COLOR[call.want]
      ctx.strokeStyle = INK
      ctx.beginPath()
      ctx.arc(px(call.x), py(call.z), Math.max(3, 2.4 * k * 2), 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }

  // Everybody on the field who is not an islander, while a match is on.
  // With twenty of them out there the map is the only way to count.
  if (ARENA.active) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 1
    for (const unit of ARENA.units.values()) {
      if (unit.out || NPC_BY_ID.has(unit.id)) continue
      ctx.fillStyle = unit.team === 'friend' ? PAINT.friend : PAINT.enemy
      ctx.beginPath()
      ctx.arc(
        px(unit.x),
        py(unit.z),
        Math.max(2.2, 1.4 * k * 2),
        0,
        Math.PI * 2,
      )
      ctx.fill()
      ctx.stroke()
    }
  }

  // People — coloured by side once a paintball match is on. Nobody is drawn
  // at all during hide and seek: a map that says where everyone is standing
  // is the one thing that game cannot survive.
  if (opts.people && !HIDE.active) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 1
    for (const npc of NPCS) {
      if (npc.area !== 'island') continue
      const live = ACTOR_POS.get(npc.id)
      const x = px(live?.x ?? npc.position[0])
      const y = py(live?.z ?? npc.position[1])
      const unit = ARENA.active ? ARENA.units.get(npc.id) : undefined
      if (unit?.out) continue
      ctx.fillStyle = unit
        ? unit.team === 'friend'
          ? PAINT.friend
          : PAINT.enemy
        : '#fdf7e9'
      ctx.beginPath()
      ctx.arc(x, y, Math.max(unit ? 2.2 : 1.6, 1.4 * k * 2), 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }

  // The player, as an arrow pointing the way the camera faces.
  const ax = px(PLAYER_POS.x)
  const ay = py(PLAYER_POS.z)
  const heading = PLAYER_VIEW.facing
  const r = Math.max(4, 3.4 * k * 2)

  ctx.save()
  ctx.translate(ax, ay)
  // Canvas +Y is south, so a heading of 0 must point down the screen.
  ctx.rotate(Math.PI - heading)
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.3)
  ctx.lineTo(r * 0.85, r)
  ctx.lineTo(0, r * 0.5)
  ctx.lineTo(-r * 0.85, r)
  ctx.closePath()
  ctx.fillStyle = '#e8442f'
  ctx.fill()
  ctx.strokeStyle = '#fdf7e9'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}
