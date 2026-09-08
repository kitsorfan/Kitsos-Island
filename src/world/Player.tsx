import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Group, type Mesh } from 'three'
import { INTERIOR_BY_ID } from '../data/interiors'
import { BOARD } from '../data/minigames'
import { AMALIA, PARTY_BUTTON, TUXEDO } from '../data/party'
import {
  BUILDINGS,
  BUILDING_BY_ID,
  ISLAND_WALK_RADIUS,
  KEY_BY_ID,
  MISSION_BY_ID,
  NPCS,
  PLAYER_COLORS,
  PLAYER_START,
  SIGNS,
} from '../data/world'
import {
  STATIC_COLLIDERS,
  TREE_COLLIDERS,
  groundHeight,
  probeCamera,
} from '../game/terrain'
import type { Collider } from '../game/terrain'
import { resolveCollisions, type Bounds } from '../game/collision'
import { INTERIOR_MARGIN, interiorColliders } from '../game/interior'
import { ACTOR_POS } from '../game/actors'
import {
  consumeFire,
  consumeInteract,
  consumeJump,
  isCrouching,
  readCameraTurn,
  readMove,
} from '../game/input'
import { ARENA, PAINT, aimAt, playerFire } from '../game/paintball'
import { challenge, watchGates } from '../game/guard'
import { PARTY, atCentre, onFloor } from '../game/party'
import { isInteractive, keyCount, useGame } from '../state/store'
import type { Nearby } from '../state/store'
import { Character, type CharacterMotion } from './Character'
import * as sfx from '../game/audio'

const WALK_SPEED = 10
const RUN_SPEED = 19
const INDOOR_SPEED = 6.5
/** Ducked under fire you barely move, which is the trade for not being hit. */
const CROUCH_SPEED = 3.4
const PLAYER_RADIUS = 0.5
const JUMP_SPEED = 9.2
const GRAVITY = 26

const OUTDOOR_CAM = { distance: 22, height: 15.5 }
/** A match needs to see further out than a stroll does. */
const FIGHT_CAM = { distance: 27, height: 18 }

/** Live player position, read by NPCs and the minimap. */
export const PLAYER_POS = new Vector3(PLAYER_START[0], 0, PLAYER_START[1])
/** Live camera yaw, so the minimap can show which way you are facing. */
export const PLAYER_VIEW = { yaw: 0, facing: Math.PI }

/** True while a door will turn you away: locked, or shut for the night. */
function doorShut(
  id: string,
  state: { night: boolean; lighthouseOpen: boolean },
): boolean {
  const building = BUILDING_BY_ID.get(id)
  if (!building) return false
  if (building.closesAtNight && state.night) return true
  return Boolean(building.locksWith) && !state.lighthouseOpen
}

interface Target extends Nearby {
  x: number
  z: number
  range: number
  /** Recomputed each frame for characters that move. */
  live?: string
  trigger: () => void
}

export function Player() {
  const group = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.size)
  const area = useGame((s) => s.area)
  /** Only a re-render can put the marker in his hand, so subscribe to it. */
  const armed = useGame((s) => s.paintball !== null)
  const night = useGame((s) => s.night)
  const handLight = useGame((s) => s.handLight)
  /** Her prompt only exists once she is down there, so it is subscribed. */
  const amaliaHere = useGame((s) => s.amaliaHere)
  const outfit = useGame((s) => s.outfit)

  const position = useRef<[number, number]>([...PLAYER_START])
  const facing = useRef(Math.PI)
  const yaw = useRef(0)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const camReady = useRef(false)
  const boom = useRef(1)
  const spawnToken = useRef(-1)
  /** Height above the ground, and its rate of change. */
  const hop = useRef({ y: 0, vy: 0 })
  /** Keeps the empty-hopper click from firing every frame. */
  const dryGap = useRef(0)
  const shadow = useRef<Mesh>(null)

  const indoors = area !== 'island'
  const interior = indoors ? INTERIOR_BY_ID.get(area) : undefined

  /** Rooms vary a lot in size, so the indoor lens scales with the floor. */
  const indoorCam = useMemo(() => {
    if (!interior) return null
    const reach = Math.max(interior.half[0], interior.half[1])
    return { distance: 12 + reach * 0.5, height: 11 + reach * 0.42 }
  }, [interior])

  /* ----------------------------- colliders ---------------------------- */

  const staticColliders = useMemo<Collider[]>(() => {
    if (interior) return interiorColliders(interior)
    return [...STATIC_COLLIDERS, ...TREE_COLLIDERS]
  }, [interior])

  const bounds = useMemo<Bounds>(
    () =>
      interior
        ? {
            kind: 'rect',
            hx: interior.half[0] - INTERIOR_MARGIN,
            hz: interior.half[1] - INTERIOR_MARGIN,
          }
        : { kind: 'circle', radius: ISLAND_WALK_RADIUS },
    [interior],
  )

  /** Characters standing in this area, so you cannot walk through them. */
  const actorIds = useMemo(
    () => NPCS.filter((n) => n.area === area).map((n) => n.id),
    [area],
  )
  const actorColliders = useRef<Collider[]>([])

  /* --------------------------- interactions --------------------------- */

  const targets = useMemo<Target[]>(() => {
    const store = useGame.getState()
    const list: Target[] = []

    for (const npc of NPCS) {
      if (npc.area !== area) continue
      if (npc.shift && npc.shift !== (night ? 'night' : 'day')) continue
      list.push({
        id: npc.id,
        kind: 'npc',
        label: npc.name,
        verb: 'Talk to',
        x: npc.position[0],
        z: npc.position[1],
        live: npc.id,
        range: 3.4,
        trigger: () => {
          const state = useGame.getState()
          sfx.confirm()
          const mission = npc.gives ? MISSION_BY_ID.get(npc.gives) : undefined
          const started = mission && state.missions[mission.id] === 'idle'
          const ongoing =
            mission && state.missions[mission.id] === 'active' && npc.missionLines

          state.talk({
            speaker: npc.name,
            role: npc.role,
            lines: ongoing ? npc.missionLines! : npc.lines,
          })
          if (npc.journal) {
            state.record({
              id: npc.id,
              title: npc.journal.title,
              body: npc.journal.body,
              source: npc.name,
            })
          }
          if (started) state.activateMission(mission.id)
        },
      })
    }

    if (!indoors) {
      for (const b of BUILDINGS) {
        list.push({
          id: b.id,
          kind: 'door',
          label: b.name,
          verb: 'Enter',
          x: b.door[0],
          z: b.door[1],
          range: 4.2,
          trigger: () => {
            const state = useGame.getState()
            if (b.closesAtNight && state.night) {
              if (b.sentries) {
                sfx.whistle()
                challenge(PLAYER_POS.x, PLAYER_POS.z)
              } else {
                sfx.cancel()
              }
              state.talk({
                speaker: b.name,
                role: 'Closed for the night',
                lines: b.closesAtNight,
              })
              return
            }
            if (b.locksWith && !state.lighthouseOpen) {
              const have = keyCount(state.keys)
              if (have < b.locksWith) {
                sfx.cancel()
                state.talk({
                  speaker: b.name,
                  role: 'Locked',
                  lines: [
                    `Five heavy locks, one for each district. ${have} of ${b.locksWith} keys turned.`,
                    'Every district building hides one. Ask the people who work there.',
                  ],
                })
                return
              }
              sfx.jingle()
              state.unlockLighthouse()
              state.talk({
                speaker: b.name,
                role: 'Unlocked',
                lines: [
                  'All five locks turn at once. The door gives with a long, dry groan.',
                  'Stairs spiral up into the light. Step inside.',
                ],
              })
              state.discover(b.id)
              return
            }
            sfx.confirm()
            state.enterBuilding(b.id)
          },
        })
      }

      // Aimed at the middle of the board rather than one face of it, so it
      // reads from whichever side you walk up on.
      list.push({
        id: 'games-board',
        kind: 'board',
        label: BOARD.label,
        verb: 'Read',
        x: BOARD.position[0],
        z: BOARD.position[1],
        range: 4.8,
        trigger: () => {
          const state = useGame.getState()
          if (state.night) {
            sfx.cancel()
            state.talk({
              speaker: BOARD.label,
              role: 'Closed for the night',
              lines: [
                'All three games are played in daylight — nobody is going to find a paintball, a coin or a gathering in the dark.',
                'There is a party button across the road, though, and that one only works after dark.',
              ],
            })
            return
          }
          state.openArcade()
        },
      })

      // Only once she is actually down there, and tracked live: she does not
      // stay where she landed.
      if (amaliaHere) {
        list.push({
          id: AMALIA.id,
          kind: 'npc',
          label: AMALIA.name,
          verb: 'Talk to',
          x: AMALIA.position[0],
          z: AMALIA.position[1],
          live: AMALIA.id,
          range: 2.6,
          trigger: () => {
            sfx.confirm()
            useGame.getState().talk({
              speaker: AMALIA.name,
              role: AMALIA.role,
              lines: AMALIA.lines,
            })
          },
        })
      }

      list.push({
        id: 'party-button',
        kind: 'board',
        label: PARTY_BUTTON.label,
        verb: 'Press',
        x: PARTY_BUTTON.position[0],
        z: PARTY_BUTTON.position[1],
        range: 3.4,
        trigger: () => {
          const state = useGame.getState()
          if (!state.night) {
            sfx.cancel()
            state.talk({
              speaker: PARTY_BUTTON.label,
              role: 'Dead in daylight',
              lines: [
                'The dome lights, hums, and does nothing at all.',
                'A plate under it reads: AFTER DARK ONLY. Come back when the lamps are on.',
              ],
            })
            return
          }
          state.toggleParty()
        },
      })

      for (const s of SIGNS) {
        list.push({
          id: s.id,
          kind: 'sign',
          label: s.label,
          verb: 'Read',
          x: s.position[0],
          z: s.position[1],
          range: 3,
          trigger: () => {
            sfx.confirm()
            useGame.getState().talk({
              speaker: s.label,
              role: 'Signpost',
              lines: s.lines,
            })
          },
        })
      }
    }

    if (interior) {
      const building = BUILDING_BY_ID.get(interior.id)
      const accent = building?.accent ?? '#3f7bd6'

      for (const exhibit of interior.exhibits) {
        if (exhibit.kind === 'key') {
          list.push({
            id: exhibit.id,
            kind: 'key',
            label: exhibit.label,
            verb: 'Search',
            x: exhibit.position[0],
            z: exhibit.position[1],
            range: 2.8,
            trigger: () => {
              const state = useGame.getState()
              const key = exhibit.keyId ? KEY_BY_ID.get(exhibit.keyId) : undefined
              if (!key) return
              if (state.keys[key.id]) {
                sfx.cancel()
                state.talk({
                  speaker: 'Empty',
                  role: interior.name,
                  lines: ['You already took the key from here.'],
                })
                return
              }
              sfx.jingle()
              state.takeKey(key.id)
              state.talk({
                speaker: key.name,
                role: 'Key found',
                lines: [
                  `You lift the ${key.name.toLowerCase()} from ${exhibit.label}.`,
                  `${keyCount(state.keys) + 1} of 5 locks on the Old Lighthouse can turn now.`,
                ],
              })
            },
          })
          continue
        }

        list.push({
          id: exhibit.id,
          kind: 'exhibit',
          label: exhibit.label,
          verb: 'Examine',
          x: exhibit.position[0],
          z: exhibit.position[1],
          range: 2.9,
          trigger: () => {
            const state = useGame.getState()
            sfx.confirm()
            if (exhibit.panel) {
              state.openPanel({
                kicker: exhibit.panel.kicker,
                title: exhibit.panel.title,
                sections: exhibit.panel.sections,
                accent,
                kind: exhibit.kind,
              })
            } else if (exhibit.lines) {
              state.talk({ speaker: exhibit.label, lines: exhibit.lines })
            }
            if (exhibit.journal) {
              state.record({
                id: exhibit.id,
                title: exhibit.journal.title,
                body: exhibit.journal.body,
                source: interior.name,
              })
            }
          },
        })
      }

      list.push({
        id: 'exit',
        kind: 'exit',
        label: 'Step outside',
        verb: '',
        x: 0,
        z: interior.half[1] - 1.8,
        range: 2.4,
        trigger: () => {
          sfx.cancel()
          useGame.getState().leaveBuilding()
        },
      })
    }

    void store
    return list
  }, [area, indoors, interior, amaliaHere, night])

  /* ------------------------------- frame ------------------------------ */

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const store = useGame.getState()
    const active = isInteractive(store.mode)

    // Teleports: entering a building, leaving one, or travelling from the map.
    if (store.spawn.token !== spawnToken.current) {
      spawnToken.current = store.spawn.token
      position.current[0] = store.spawn.position[0]
      position.current[1] = store.spawn.position[1]
      camReady.current = false
      boom.current = 1
      if (store.area !== 'island') {
        yaw.current = 0
        facing.current = Math.PI
      }
    }

    /** True only while a paintball match is actually being fought. */
    const fight = ARENA.active && store.paintball?.status === 'playing'
    const crouching = fight && active && isCrouching()
    motion.current.crouching = crouching
    dryGap.current = Math.max(0, dryGap.current - delta)

    const cam = indoorCam ?? (fight ? FIGHT_CAM : OUTDOOR_CAM)

    const turn = active ? readCameraTurn() : 0
    yaw.current += turn * delta * 1.8

    const move = active ? readMove() : { x: 0, y: 0, run: false }
    const magnitude = Math.hypot(move.x, move.y)
    const speed = crouching
      ? CROUCH_SPEED
      : indoors
        ? INDOOR_SPEED
        : move.run
          ? RUN_SPEED
          : WALK_SPEED

    // Live colliders for anyone walking around this area.
    actorColliders.current = actorIds.flatMap((id) => {
      const p = ACTOR_POS.get(id)
      return p ? [{ x: p.x, z: p.z, hx: 0.7, hz: 0.7, circle: true }] : []
    })

    if (magnitude > 0.02) {
      const sin = Math.sin(yaw.current)
      const cos = Math.cos(yaw.current)
      const dx = cos * move.x - sin * move.y
      const dz = -sin * move.x - cos * move.y

      position.current[0] += dx * speed * delta
      position.current[1] += dz * speed * delta
      resolveCollisions(
        position.current,
        PLAYER_RADIUS,
        [...staticColliders, ...actorColliders.current],
        bounds,
      )

      const desired = Math.atan2(dx, dz)
      let diff = desired - facing.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      facing.current += diff * Math.min(1, delta * 14)

      motion.current.moving = true
      motion.current.speed = speed * magnitude
      if (!store.hasMoved) store.markMoved()
    } else {
      motion.current.moving = false
      motion.current.speed = 0
    }

    // Stand still on the floor with the music on and he joins in.
    motion.current.dance =
      PARTY.active &&
      !indoors &&
      !motion.current.moving &&
      onFloor(position.current[0], position.current[1])
        ? 1
        : 0

    // Walking into the middle of the floor calls her down.
    if (
      PARTY.active &&
      !indoors &&
      !store.amaliaHere &&
      atCentre(position.current[0], position.current[1])
    ) {
      store.callAmalia()
    }

    // --- Jump ---------------------------------------------------------
    // Space throws paint during a match, so hopping sits it out.
    if (active && !fight && consumeJump() && hop.current.y <= 0.001) {
      hop.current.vy = JUMP_SPEED
      sfx.hop()
    }
    if (hop.current.vy !== 0 || hop.current.y > 0) {
      hop.current.vy -= GRAVITY * delta
      hop.current.y += hop.current.vy * delta
      if (hop.current.y <= 0) {
        hop.current.y = 0
        hop.current.vy = 0
      }
    }
    motion.current.airborne = hop.current.y > 0.02

    const [px, pz] = position.current
    const py = (indoors ? 0 : groundHeight(px, pz)) + hop.current.y
    PLAYER_POS.set(px, py, pz)
    PLAYER_VIEW.yaw = yaw.current
    PLAYER_VIEW.facing = facing.current

    /* --------------------------- paintball -------------------------- */

    if (fight) {
      // Standing still he squares up with the camera, so Q and R aim him
      // without having to walk a circle first.
      if (!motion.current.moving) {
        let square = yaw.current + Math.PI - facing.current
        while (square > Math.PI) square -= Math.PI * 2
        while (square < -Math.PI) square += Math.PI * 2
        facing.current += square * Math.min(1, delta * 6)
      }

      const game = store.paintball!
      if (game.reloadAt !== null && Date.now() >= game.reloadAt) {
        store.finishReload()
        sfx.reload()
      }

      if (active && consumeFire() && ARENA.fireGap <= 0) {
        if (game.ammo > 0 && game.reloadAt === null) {
          // The marker leads the nearest enemy inside the aim cone, so a
          // third-person camera does not need a mouse to aim.
          const shot = aimAt(px, pz, facing.current)
          playerFire(px, pz, shot.angle, crouching)
          facing.current = shot.angle
          store.fireRound()
          sfx.pop()
          motion.current.recoil = 0.14
        } else if (dryGap.current <= 0) {
          sfx.dry()
          dryGap.current = 0.6
        }
      }
    }

    if (group.current) {
      group.current.position.set(px, py, pz)
      group.current.rotation.y = facing.current
    }
    // The blob shadow stays on the ground and shrinks as he rises.
    if (shadow.current) {
      shadow.current.position.y = 0.03 - hop.current.y
      const shrink = Math.max(0.45, 1 - hop.current.y * 0.28)
      shadow.current.scale.setScalar(shrink)
    }

    // Walking near a building counts as finding it, for fast travel.
    if (!indoors) {
      for (const b of BUILDINGS) {
        if (Math.hypot(px - b.position[0], pz - b.position[1]) < 34) {
          store.discover(b.id)
        }
      }
    }

    /* ---------------------------- camera ---------------------------- */

    let span = 1
    if (!indoors) {
      const probe = probeCamera(
        px,
        py + 1.5,
        pz,
        Math.sin(yaw.current) * cam.distance,
        cam.height - 1.5,
        Math.cos(yaw.current) * cam.distance,
      )
      span = probe.span
      if (probe.blocker && turn === 0) {
        const ax = px - probe.blocker.x
        const az = pz - probe.blocker.z
        const len = Math.hypot(ax, az)
        if (len > 0.05) {
          let swing = Math.atan2(ax / len, az / len) - yaw.current
          while (swing > Math.PI) swing -= Math.PI * 2
          while (swing < -Math.PI) swing += Math.PI * 2
          yaw.current += Math.sign(swing) * Math.min(Math.abs(swing), delta * 2.6)
        }
      }
    }
    boom.current +=
      (span - boom.current) * Math.min(1, delta * (span < boom.current ? 9 : 3))

    const aspect = viewport.width / Math.max(1, viewport.height)
    const framing = Math.min(1.32, Math.max(1, 1 + (1.15 - aspect) * 0.42))

    const reach = cam.distance * framing * boom.current
    const targetX = px + Math.sin(yaw.current) * reach
    const targetZ = pz + Math.cos(yaw.current) * reach
    // Track the ground, not the hop, so the camera does not bounce.
    const targetY =
      py - hop.current.y + cam.height * framing * (0.72 + 0.28 * boom.current)

    if (!camReady.current) {
      camera.position.set(targetX, targetY, targetZ)
      camReady.current = true
    }
    const ease = 1 - Math.pow(0.0015, delta)
    camera.position.x += (targetX - camera.position.x) * ease
    camera.position.y += (targetY - camera.position.y) * ease
    camera.position.z += (targetZ - camera.position.z) * ease
    camera.lookAt(px, py - hop.current.y + 1.4, pz)

    /* -------------------------- interaction ------------------------- */

    // Nobody stops mid-match to read a signpost.
    if (fight) {
      store.setNearby(null)
      consumeInteract()
      return
    }

    // Walk up on a gate that has soldiers on it and they will let you know
    // long before you reach the handle.
    if (!indoors && watchGates(px, pz, delta, store.night)) sfx.whistle()

    let best: Target | null = null
    let bestDist = Infinity
    for (const t of targets) {
      const live = t.live ? ACTOR_POS.get(t.live) : undefined
      const tx = live?.x ?? t.x
      const tz = live?.z ?? t.z
      const d = Math.hypot(px - tx, pz - tz)
      if (d < t.range && d < bestDist) {
        best = t
        bestDist = d
      }
    }

    if (active) {
      store.setNearby(
        best
          ? {
              id: best.id,
              kind: best.kind,
              label: best.label,
              verb: best.verb,
              blocked: best.kind === 'door' && doorShut(best.id, store),
            }
          : null,
      )
      if (consumeInteract() && best) best.trigger()
    } else {
      consumeInteract()
    }
  })

  return (
    <group ref={group}>
      <Character
        colors={outfit === 'tuxedo' ? TUXEDO : PLAYER_COLORS}
        motion={motion}
        gun={armed}
        gunColor={PAINT.player}
        suit={outfit === 'tuxedo'}
        bouquet={outfit === 'tuxedo'}
        // Happy, from the moment she is called down.
        smile={amaliaHere}
        // Both hands are full at his own dance.
        hand={night && outfit !== 'tuxedo' ? handLight : undefined}
        danceStyle={amaliaHere ? 3 : undefined}
      />
      {/* Soft blob shadow so the player never looks like it floats. */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.22} />
      </mesh>
    </group>
  )
}
