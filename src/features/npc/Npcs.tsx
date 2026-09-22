import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import type { Group } from 'three'
import {
  FEAST,
  FEAST_AREA,
  FEAST_WALK,
  VIA_REACHED,
  facingTable,
  feastFurniture,
  residentsOf,
  setOffFor,
  viaFor,
} from '../party/feast'
import {
  DEAN_DELAY,
  DEAN_PATH,
  DEAN_SPOT,
  DEAN_VIA_REACHED,
  DEAN_WALK,
  LEAVE_STAGGER,
  LECTURE,
  classPresent,
  SEAT_WALK,
  SEATS,
  facingPodium,
  hallFurniture,
} from '../lecture/lecture'
import { INTERIOR_MARGIN } from '../interior/interiorLogic'
import { ACTOR_POS, REACTIONS } from './actors'
import { groundHeight } from '../island/terrainLogic'
import { ARENA, PAINT } from '../paintball/paintballLogic'
import { PARTY, danceSpot } from '../party/partyLogic'
import { CHALLENGE_EARSHOT, GUARD } from './guard'
import { HIDE, PLAYERS } from '../hide/hideLogic'
import { resolveCollisions } from '../../shared/engine/collision'
import { ISLAND_WALK_RADIUS } from '../island/world'
import { STATIC_COLLIDERS } from '../island/terrainLogic'
import type { Collider } from '../island/terrainLogic'
import { useGame } from '../../shared/state/store'
import { Character, type CharacterMotion } from '../player/Character'
import { PLAYER_POS } from '../player/playerLogic'
import type { Npc, Vec2 } from '../../types'

/** How close you have to be before someone stops walking to greet you. */
const GREET_RANGE = 6

/**
 * How big a child is built against a grown-up. Everything that floats over a
 * head — the journal marker, the chat bubble, a paintball team ring — is
 * outside the scaled body, so each one multiplies its own height by this
 * rather than inheriting it, and a child's marker sits over a child's head.
 */
const CHILD_SCALE = 0.72

/** How fast an islander gets away from a water bomb that has just landed. */
const BOLT_SPEED = 7.4

/** How fast a sentry closes on somebody, and how close they end up. */
const MARCH_SPEED = 5.2
const IN_YOUR_FACE = 2.4
/** How far to either side they stand, so two of them are not one of them. */
const SHOULDER = 1.5

/** Everyone else standing in this area, as circles to be kept out of. */
function others(self: string) {
  const out: Collider[] = []
  for (const [id, p] of ACTOR_POS) {
    if (id === self) continue
    out.push({ x: p.x, z: p.z, hx: 0.8, hz: 0.8, circle: true })
  }
  return out
}

/** Everyone hide and seek puts on the island, whatever hours they keep. */
const PLAYING = new Set(PLAYERS)

export function Npcs({ area }: { area: string }) {
  const night = useGame((s) => s.night)
  /**
   * Christmas Day empties the rooms of Kitsos House into the basement and
   * brings her side of the family with it, so who is in an area is a question
   * about the calendar before it is a question about the hour.
   */
  const christmas = useGame((s) => s.christmas)
  /**
   * And the thesis defence brings a class into the lecture hall that is not
   * there the rest of the time, so who is in a room is a question about the
   * lectern too. A boolean, so the slides turning does not re-roster anybody
   * — only the room filling and emptying does.
   */
  const defending = useGame((s) => s.lecture !== null)
  /**
   * How many of the class are still in the room.
   *
   * The store's `lecture` goes null the instant he steps away from the
   * lectern, but the class is not gone then — they are walking to the doors,
   * and they leave the roster one at a time as each of them reaches one. So
   * the roster is rebuilt on that count rather than on the flag, and a room
   * emptying is eight people leaving rather than eight people blinking out.
   *
   * It only ever changes while somebody is actually walking out, so this is
   * a handful of re-renders at the end of a defence and none at any other
   * time.
   */
  const [present, setPresent] = useState(0)
  useFrame(() => {
    const here = classPresent() ? SEATS.length - LECTURE.gone.size : 0
    setPresent((was) => (was === here ? was : here))
  })

  const residents = useMemo(
    () => residentsOf(area, christmas),
    // Neither `defending` nor `present` is read by `residentsOf` directly —
    // `placed` reads the live LECTURE flags — but between them they change
    // exactly when those flags do, which is what has to re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [area, christmas, defending, present],
  )
  /**
   * A game of hide and seek is played at night by everyone who is not on a
   * night shift — which is to say, by people this filter would otherwise have
   * sent home. Sergeant Petros keeps day hours and so hid, was found, and had
   * his ring drawn on an empty patch of grass, because nothing ever drew him.
   */
  const playing = useGame((s) => s.hide !== null)
  // The night shift is only out there once the lamps are on.
  const here = residents.filter(
    (n) =>
      !n.shift ||
      n.shift === (night ? 'night' : 'day') ||
      (playing && PLAYING.has(n.id)),
  )
  return (
    <group>
      {here.map((npc, i) => (
        <NpcActor
          key={npc.id}
          npc={npc}
          seed={i * 1.7}
          index={i}
          indoors={area !== 'island'}
          feasting={christmas && area === FEAST_AREA}
        />
      ))}
    </group>
  )
}

/**
 * A little speech bubble over somebody's head, on and off.
 *
 * Ten characters all talking at once would be ten bubbles blinking in unison,
 * so each one runs its own cycle off its seed: roughly two seconds of talking
 * in every six, and never the same two seconds as their neighbour. It is the
 * cheapest possible way to say "this room is noisy" — three dots and a tail.
 */
function ChatBubble({ seed, scale = 1 }: { seed: number; scale?: number }) {
  const bubble = useRef<Group>(null)
  useFrame((state) => {
    if (!bubble.current) return
    const cycle = (state.clock.elapsedTime * 0.17 + seed * 0.37) % 1
    const on = cycle < 0.34
    bubble.current.visible = on
    if (!on) return
    // Swells in and settles, rather than popping into existence at full size.
    const age = cycle / 0.34
    const grow = Math.min(1, age * 7)
    bubble.current.scale.setScalar((0.85 + grow * 0.15) * scale)
    bubble.current.position.y =
      (2.62 + Math.sin(state.clock.elapsedTime * 2.4 + seed) * 0.02) * scale
  })
  return (
    <Billboard>
      <group ref={bubble} position={[0.55 * scale, 2.62 * scale, 0]}>
        <mesh>
          <planeGeometry args={[0.72, 0.38]} />
          <meshBasicMaterial color="#fdf7e9" transparent opacity={0.96} />
        </mesh>
        {/* The tail, pointing back down at whoever is talking. */}
        <mesh position={[-0.27, -0.22, 0]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshBasicMaterial color="#fdf7e9" transparent opacity={0.96} />
        </mesh>
        {[-0.19, 0, 0.19].map((x) => (
          <mesh key={x} position={[x, 0, 0.01]}>
            <circleGeometry args={[0.052, 8]} />
            <meshBasicMaterial color="#6b5f52" />
          </mesh>
        ))}
      </group>
    </Billboard>
  )
}

function NpcActor({
  npc,
  seed,
  index,
  indoors,
  feasting,
}: {
  npc: Npc
  seed: number
  /** Their place in the crowd, which decides where they dance. */
  index: number
  indoors: boolean
  /** In the basement, on the twenty-fifth. Their day runs differently. */
  feasting: boolean
}) {
  const group = useRef<Group>(null)
  const marker = useRef<Group>(null)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const at = useRef<[number, number]>([...npc.position])
  const leg = useRef(0)
  /** Which leg of the walk down to the front the Dean is on, at a defence. */
  const stride = useRef(0)
  /** Whether that walk is the one out again, so the turn resets the leg. */
  const homeward = useRef(false)
  /** Eased fall, for someone who has just been painted out. */
  const fall = useRef(0)
  /** Whether they are past the end of the table on the way to their place. */
  const rounded = useRef(false)
  const body = useRef<Group>(null)
  const met = useGame((s) => Boolean(s.visited[npc.id]))

  // Both of these are primitives, so a mid-match ammo change costs nothing.
  const team = useGame((s) =>
    s.paintball && s.paintball.status !== 'briefing'
      ? s.paintball.friends.includes(npc.id)
        ? 'friend'
        : 'enemy'
      : null,
  )
  const painted = useGame((s) => Boolean(s.paintball?.out[npc.id]))
  /** Out looking for you, which means a torch in hand. */
  const searching = useGame(
    (s) => s.hide?.role === 'hider' && s.hide.status === 'playing',
  )
  /** Any game of hide and seek at all, which hides the journal marker: a
   *  yellow exclamation over somebody's head rather gives them away. */
  const anonymous = useGame((s) => s.hide !== null)

  useEffect(() => {
    // `at` is the authority once the frame loop has it, so somebody whose
    // position has changed under them — the family, coming downstairs on
    // Christmas Day — has to be put there rather than walked there.
    //
    // The class is the one exception: their `position` is the desk they end
    // up at, and a class that is already sitting at its desks the instant
    // the room fills has not filed in, it has appeared. So they start in the
    // doorway they came through and walk in from there.
    const start = npc.lecture
      ? SEATS[Number(npc.id.slice('class-'.length))].from
      : npc.position
    at.current = [...start]
    ACTOR_POS.set(npc.id, { x: start[0], z: start[1] })
    return () => {
      ACTOR_POS.delete(npc.id)
    }
  }, [npc.id, npc.position, npc.lecture])

  useFrame((state, rawDelta) => {
    if (!group.current) return
    const delta = Math.min(rawDelta, 0.05)
    // Only hide and seek folds anybody's knees, and only while it is on.
    // Cleared every frame so that walking out of a game — or out of the one
    // hiding place they were tucked into — puts them back on their feet.
    motion.current.crouching = false
    motion.current.chat = 0

    // A match takes the wheel: paintball.ts owns where everyone stands.
    const unit = ARENA.active ? ARENA.units.get(npc.id) : undefined
    if (unit) {
      at.current[0] = unit.x
      at.current[1] = unit.z
      motion.current.moving = unit.moving
      motion.current.speed = unit.speed

      const y = groundHeight(unit.x, unit.z)
      group.current.position.set(unit.x, y, unit.z)
      ACTOR_POS.set(npc.id, { x: unit.x, z: unit.z })

      let turn = unit.facing - group.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      group.current.rotation.y += turn * Math.min(1, delta * 7)

      // Whoever is out goes flat on their back until the round is over.
      fall.current +=
        ((unit.out ? 1 : 0) - fall.current) * Math.min(1, delta * 7)
      if (body.current) {
        body.current.rotation.x = -fall.current * 1.42
        body.current.position.y = fall.current * 0.14
      }
      return
    }

    if (fall.current > 0.001) {
      fall.current = Math.max(0, fall.current - delta * 4)
      if (body.current) {
        body.current.rotation.x = -fall.current * 1.42
        body.current.position.y = fall.current * 0.14
      }
    }

    // A party pulls everyone into the square: walk to your spot on the
    // floor, then dance until the music stops. Everyone, that is, except
    // whoever is on shift — the night watch does not leave the gate.
    if (PARTY.active && !indoors && npc.shift !== 'night') {
      const spot = danceSpot(index)
      const gapX = spot.x - at.current[0]
      const gapZ = spot.z - at.current[1]
      const gap = Math.hypot(gapX, gapZ)

      if (gap > 0.5) {
        const step = Math.min(gap, 4.6 * delta)
        at.current[0] += (gapX / gap) * step
        at.current[1] += (gapZ / gap) * step
        motion.current.moving = true
        motion.current.speed = 4.6
        motion.current.dance = 0
      } else {
        motion.current.moving = false
        motion.current.speed = 0
        motion.current.dance = 1
      }

      const [dxp, dzp] = at.current
      group.current.position.set(dxp, indoors ? 0 : groundHeight(dxp, dzp), dzp)
      ACTOR_POS.set(npc.id, { x: dxp, z: dzp })

      // Face in at the middle of the floor, where everyone else is.
      const inward = Math.atan2(-dxp, -dzp)
      let turn = inward - group.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      group.current.rotation.y += turn * Math.min(1, delta * 4)
      return
    }
    motion.current.dance = 0

    // Hide and seek takes the wheel: hide.ts owns where everybody is and
    // which way they are pointing their torch, because that beam is the
    // whole of what the game is read off.
    const play = HIDE.active
      ? HIDE.folk.find((f) => f.id === npc.id)
      : undefined
    if (play) {
      at.current[0] = play.x
      at.current[1] = play.z
      motion.current.moving = play.moving
      motion.current.speed = play.speed
      motion.current.halt = 0
      motion.current.crouching = HIDE.role === 'seeker' && !play.found
      group.current.position.set(play.x, groundHeight(play.x, play.z), play.z)
      ACTOR_POS.set(npc.id, { x: play.x, z: play.z })
      let turn = play.facing - group.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      group.current.rotation.y += turn * Math.min(1, delta * 7)
      return
    }

    // Christmas dinner, in its two halves. Until the host reaches the head
    // of the table they are in their conversations; once he does, everybody
    // leaves it, walks over and takes their place. Their own `position` is
    // where they started the day, so it doubles as the spot to drift back to.
    if (feasting && npc.feast) {
      // They leave their conversation in ones and twos rather than all on
      // the same frame, which is both how people actually do it and what
      // keeps the lane along the far side of the table clear for whoever is
      // still walking down it.
      const waiting =
        FEAST.seated &&
        performance.now() / 1000 - FEAST.calledAt < setOffFor(npc.id)
      const walking = FEAST.seated && !waiting

      // Anyone with the end of the table to get round heads for that first
      // and for their place once they are past it. The leg is remembered, so
      // arriving at the corner is not something they can wander back out of.
      const via = walking ? viaFor(npc.id) : undefined
      if (!FEAST.seated) rounded.current = false
      else if (via && !rounded.current) {
        const left = Math.hypot(via[0] - at.current[0], via[1] - at.current[1])
        if (left < VIA_REACHED) rounded.current = true
      }

      const [tx, tz] =
        via && !rounded.current ? via : walking ? npc.feast : npc.position
      const gapX = tx - at.current[0]
      const gapZ = tz - at.current[1]
      const gap = Math.hypot(gapX, gapZ)

      if (gap > 0.22) {
        const step = Math.min(gap, FEAST_WALK * delta)
        const to: [number, number] = [
          at.current[0] + (gapX / gap) * step,
          at.current[1] + (gapZ / gap) * step,
        ]
        // Ten people crossing one room at once, so nobody walks through
        // anybody — or through the long table between them and their seat,
        // which is what half of them have to get round. The room bounds them.
        resolveCollisions(to, 0.5, [...feastFurniture(), ...others(npc.id)], {
          kind: 'rect',
          hx: 15 - INTERIOR_MARGIN,
          hz: 11 - INTERIOR_MARGIN,
        })
        at.current[0] = to[0]
        at.current[1] = to[1]
        motion.current.moving = true
        motion.current.speed = FEAST_WALK
        motion.current.chat = 0
      } else {
        motion.current.moving = false
        motion.current.speed = 0
        // Arrived, and talking — which is what they are doing all day.
        motion.current.chat = 1
      }

      const [fx, fz] = at.current
      group.current.position.set(fx, 0, fz)
      ACTOR_POS.set(npc.id, { x: fx, z: fz })

      // Standing at your place is what the toast waits for, and the last
      // centimetre of it should not hold the whole room up — so this is a
      // good deal looser than the distance that stops them walking.
      const toSeat = Math.hypot(npc.feast[0] - fx, npc.feast[1] - fz)
      if (FEAST.seated && toSeat < 1.1) FEAST.atTable.add(npc.id)
      else FEAST.atTable.delete(npc.id)

      // At the table everybody looks at the table. Standing about they look
      // at whoever they came to talk to — unless the host has walked up, in
      // which case they look at him, because that is what people do.
      const near = Math.hypot(PLAYER_POS.x - fx, PLAYER_POS.z - fz) < 3.4
      const desired = near
        ? Math.atan2(PLAYER_POS.x - fx, PLAYER_POS.z - fz)
        : FEAST.seated
          ? facingTable(at.current)
          : npc.facing
      let round = desired - group.current.rotation.y
      while (round > Math.PI) round -= Math.PI * 2
      while (round < -Math.PI) round += Math.PI * 2
      group.current.rotation.y += round * Math.min(1, delta * 6)

      if (marker.current) {
        marker.current.position.y =
          2.55 + Math.abs(Math.sin(state.clock.elapsedTime * 3 + seed)) * 0.22
      }
      return
    }

    // The man who supervised it comes down to the front for it.
    //
    // He is in the room already — he is there whether anybody is defending
    // anything or not — so unlike the class he is not spawned and despawned.
    // He simply leaves wherever he was standing, walks to the speaker's
    // shoulder, and walks back to his own spot afterwards. That is the whole
    // of it: the room fills behind him and he is already at the front of it.
    if (npc.id === 'dean' && (LECTURE.active || LECTURE.leaving)) {
      // Down to the front for the defence, and back up to his own spot
      // afterwards — the same route in reverse, because the straight line
      // between the two runs through the desks either way.
      const back = LECTURE.leaving
      // Turning round starts the route again from its own first leg, rather
      // than carrying the leg he had reached on the way down into a route
      // that is now pointing the other way.
      if (back !== homeward.current) {
        homeward.current = back
        stride.current = 0
      }
      const since =
        performance.now() / 1000 - (back ? LECTURE.leftAt : LECTURE.startedAt)
      const going = since > DEAN_DELAY

      // He walks a route rather than a straight line: out of the desks he is
      // standing in, down the clear aisle, and only then in to the front.
      // The leg is remembered, so reaching one is not something he can drift
      // back out of when the next one points him the other way.
      // The waypoints, in the order he takes them: down to the front, or
      // back out to where he stands the rest of the time.
      const route = back
        ? [...DEAN_PATH].reverse().concat([npc.position])
        : [...DEAN_PATH, DEAN_SPOT]

      if (going && stride.current < route.length - 1) {
        const mark = route[stride.current]
        const left = Math.hypot(
          mark[0] - at.current[0],
          mark[1] - at.current[1],
        )
        if (left < DEAN_VIA_REACHED) stride.current += 1
      }

      const target = !going ? at.current : route[stride.current]

      const gapX = target[0] - at.current[0]
      const gapZ = target[1] - at.current[1]
      const gap = Math.hypot(gapX, gapZ)

      if (gap > 0.2) {
        const step = Math.min(gap, DEAN_WALK * delta)
        const to: [number, number] = [
          at.current[0] + (gapX / gap) * step,
          at.current[1] + (gapZ / gap) * step,
        ]
        // Round the lectern and the desks rather than through them.
        resolveCollisions(to, 0.5, [...hallFurniture(), ...others(npc.id)], {
          kind: 'rect',
          hx: 17 - INTERIOR_MARGIN,
          hz: 13 - INTERIOR_MARGIN,
        })
        at.current[0] = to[0]
        at.current[1] = to[1]
        motion.current.moving = true
        motion.current.speed = DEAN_WALK
      } else {
        motion.current.moving = false
        motion.current.speed = 0
      }

      // He cheers at the end of it like everybody else. He was the one who
      // graded it with distinction; he is not going to sit on his hands.
      motion.current.cheer = LECTURE.applauding ? 1 : 0

      const [dx, dz] = at.current
      group.current.position.set(dx, 0, dz)
      ACTOR_POS.set(npc.id, { x: dx, z: dz })

      // Standing at the front he faces the room, not the speaker beside him.
      const desired = motion.current.moving ? Math.atan2(gapX, gapZ) : 0
      let round = desired - group.current.rotation.y
      while (round > Math.PI) round -= Math.PI * 2
      while (round < -Math.PI) round += Math.PI * 2
      group.current.rotation.y += round * Math.min(1, delta * 5)
      return
    }
    // Between defences, the next one starts him at the top of the route.
    if (npc.id === 'dean') {
      stride.current = 0
      homeward.current = false
    }

    // The thesis defence. The class comes in the door it is nearest, walks to
    // its desk and listens; at the end of it the whole room applauds.
    //
    // They are only ever in this room while `LECTURE.active`, so there is no
    // off state to write here — walking away from the lectern takes them out
    // of the roster altogether and this branch stops being reached.
    if (npc.lecture && (LECTURE.active || LECTURE.leaving)) {
      const index = Number(npc.id.slice('class-'.length))
      const seat = SEATS[index]

      // Two directions, one walk. Coming in, they wait their moment in the
      // doorway and then go to their desk; going out, they wait their moment
      // at their desk and then head back for the door they came in by.
      let target: Vec2
      if (LECTURE.leaving) {
        const since = performance.now() / 1000 - LECTURE.leftAt
        target = since > seat.delay * LEAVE_STAGGER ? seat.from : npc.lecture
      } else {
        const since = performance.now() / 1000 - LECTURE.startedAt
        target = since > (seat?.delay ?? 0) ? npc.lecture : seat.from
      }

      const gapX = target[0] - at.current[0]
      const gapZ = target[1] - at.current[1]
      const gap = Math.hypot(gapX, gapZ)

      if (gap > 0.2) {
        const step = Math.min(gap, SEAT_WALK * delta)
        const to: [number, number] = [
          at.current[0] + (gapX / gap) * step,
          at.current[1] + (gapZ / gap) * step,
        ]
        // Eight of them crossing one hall, so nobody walks through anybody
        // — or through the desks they are walking between.
        resolveCollisions(to, 0.5, others(npc.id), {
          kind: 'rect',
          hx: 17 - INTERIOR_MARGIN,
          hz: 13 - INTERIOR_MARGIN,
        })
        at.current[0] = to[0]
        at.current[1] = to[1]
        motion.current.moving = true
        motion.current.speed = SEAT_WALK
      } else {
        motion.current.moving = false
        motion.current.speed = 0
      }

      // Up on their feet the moment the defence is done, and not before:
      // they sit through the slides the way a class does, which is quietly.
      // On the way out they have stopped and are just leaving.
      motion.current.cheer = LECTURE.applauding && !LECTURE.leaving ? 1 : 0

      const [lx, lz] = at.current
      group.current.position.set(lx, 0, lz)
      ACTOR_POS.set(npc.id, { x: lx, z: lz })

      // And out of the room the moment they reach the door, which is what
      // takes them off the roster: one fewer person in the hall, not one
      // more person standing in a doorway.
      if (LECTURE.leaving) {
        const out = Math.hypot(seat.from[0] - lx, seat.from[1] - lz)
        if (out < 0.6) LECTURE.gone.add(npc.id)
      }

      // Facing the lectern while they listen, and the door while they leave.
      const desired = LECTURE.leaving
        ? Math.atan2(gapX, gapZ)
        : facingPodium(at.current)
      let round = desired - group.current.rotation.y
      while (round > Math.PI) round -= Math.PI * 2
      while (round < -Math.PI) round += Math.PI * 2
      group.current.rotation.y += round * Math.min(1, delta * 6)
      return
    }
    motion.current.cheer = 0

    // Somebody has walked up on the gate. Whoever is standing on it turns
    // round and puts a hand out; the whistle has already gone.
    const onWatch = npc.shift === 'night' && GUARD.left > 0
    const challenged =
      onWatch &&
      Math.hypot(at.current[0] - GUARD.x, at.current[1] - GUARD.z) <
        CHALLENGE_EARSHOT
    motion.current.halt = challenged ? 1 : 0
    if (challenged) {
      // While somebody is actually leaning on the line they come off their
      // posts and get in the way of it. They walk back afterwards on their
      // own, the same way anybody knocked off their post does.
      const dx = GUARD.x - at.current[0]
      const dz = GUARD.z - at.current[1]
      const gap = Math.hypot(dx, dz) || 1
      // One steps to the left of them and the next to the right, so a pair
      // coming at you ends up shoulder to shoulder rather than in one spot.
      const flank = index % 2 === 0 ? -1 : 1
      const nx = dx / gap
      const nz = dz / gap
      const tx = GUARD.x - nx * IN_YOUR_FACE - nz * flank * SHOULDER
      const tz = GUARD.z - nz * IN_YOUR_FACE + nx * flank * SHOULDER
      const reach = Math.hypot(tx - at.current[0], tz - at.current[1])

      if (GUARD.holding && reach > 0.15) {
        const step = Math.min(reach, MARCH_SPEED * delta)
        const to: [number, number] = [
          at.current[0] + ((tx - at.current[0]) / reach) * step,
          at.current[1] + ((tz - at.current[1]) / reach) * step,
        ]
        // And whatever the arithmetic says, nobody stands inside anybody.
        resolveCollisions(to, 0.8, others(npc.id), {
          kind: 'circle',
          radius: ISLAND_WALK_RADIUS - 2,
        })
        at.current[0] = to[0]
        at.current[1] = to[1]
        motion.current.moving = true
        motion.current.speed = MARCH_SPEED
      } else {
        motion.current.moving = false
        motion.current.speed = 0
      }

      const [gx, gz] = at.current
      group.current.position.set(gx, groundHeight(gx, gz), gz)
      ACTOR_POS.set(npc.id, { x: gx, z: gz })
      let square =
        Math.atan2(GUARD.x - gx, GUARD.z - gz) - group.current.rotation.y
      while (square > Math.PI) square -= Math.PI * 2
      while (square < -Math.PI) square += Math.PI * 2
      group.current.rotation.y += square * Math.min(1, delta * 9)
      return
    }

    // Something has just gone off next to them. Whatever they were doing,
    // they are doing this instead until it wears off: away from a water
    // bomb with both hands over the head, or cheering the confetti.
    const shock = indoors ? undefined : REACTIONS.get(npc.id)
    if (shock) {
      if (shock.kind === 'fright') {
        // They bolt, but only so far — nobody ends the flight on the far
        // side of the island because a bomb went off by their bench.
        const strayed = Math.hypot(
          at.current[0] - npc.position[0],
          at.current[1] - npc.position[1],
        )
        if (strayed < 11) {
          const awayX = at.current[0] - shock.x
          const awayZ = at.current[1] - shock.z
          const len = Math.hypot(awayX, awayZ) || 1
          const to: [number, number] = [
            at.current[0] + (awayX / len) * BOLT_SPEED * delta,
            at.current[1] + (awayZ / len) * BOLT_SPEED * delta,
          ]
          resolveCollisions(to, 0.5, STATIC_COLLIDERS, {
            kind: 'circle',
            radius: ISLAND_WALK_RADIUS - 2,
          })
          at.current[0] = to[0]
          at.current[1] = to[1]
          motion.current.moving = true
          motion.current.speed = BOLT_SPEED
        } else {
          motion.current.moving = false
          motion.current.speed = 0
        }
        motion.current.fright = 1
      } else {
        motion.current.moving = false
        motion.current.speed = 0
        motion.current.fright = 0
        motion.current.dance = 1
      }

      const [sx, sz] = at.current
      group.current.position.set(sx, groundHeight(sx, sz), sz)
      ACTOR_POS.set(npc.id, { x: sx, z: sz })

      // Running, they face the way out. Cheering, they face the balloon.
      const facing =
        shock.kind === 'fright'
          ? Math.atan2(sx - shock.x, sz - shock.z)
          : Math.atan2(PLAYER_POS.x - sx, PLAYER_POS.z - sz)
      let spin = facing - group.current.rotation.y
      while (spin > Math.PI) spin -= Math.PI * 2
      while (spin < -Math.PI) spin += Math.PI * 2
      group.current.rotation.y += spin * Math.min(1, delta * 8)
      return
    }
    motion.current.fright = 0

    const dx = PLAYER_POS.x - at.current[0]
    const dz = PLAYER_POS.z - at.current[1]
    const toPlayer = Math.hypot(dx, dz)
    const greeting = toPlayer < GREET_RANGE

    let heading: number | null = null

    if (npc.route && npc.route.length > 1 && !greeting) {
      const target = npc.route[leg.current % npc.route.length]
      const tx = target[0] - at.current[0]
      const tz = target[1] - at.current[1]
      const dist = Math.hypot(tx, tz)

      if (dist < 0.4) {
        leg.current = (leg.current + 1) % npc.route.length
      } else {
        const pace = npc.pace ?? 1.5
        const step = Math.min(dist, pace * delta)
        at.current[0] += (tx / dist) * step
        at.current[1] += (tz / dist) * step
        heading = Math.atan2(tx / dist, tz / dist)
        motion.current.moving = true
        motion.current.speed = pace
      }
    } else {
      // Standing at their post — or ambling back to it, if a match or a
      // water bomb has left them somewhere they do not belong.
      const backX = npc.position[0] - at.current[0]
      const backZ = npc.position[1] - at.current[1]
      const off = Math.hypot(backX, backZ)
      if (!greeting && off > 0.5) {
        const step = Math.min(off, 2.2 * delta)
        at.current[0] += (backX / off) * step
        at.current[1] += (backZ / off) * step
        heading = Math.atan2(backX / off, backZ / off)
        motion.current.moving = true
        motion.current.speed = 2.2
      } else {
        motion.current.moving = false
        motion.current.speed = 0
      }
    }

    const [x, z] = at.current
    const y = indoors ? 0 : groundHeight(x, z)
    group.current.position.set(x, y, z)
    ACTOR_POS.set(npc.id, { x, z })

    // Face the player when close, otherwise face the way they are walking.
    const desired = greeting ? Math.atan2(dx, dz) : (heading ?? npc.facing)
    let diff = desired - group.current.rotation.y
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    group.current.rotation.y += diff * Math.min(1, delta * 5)

    if (marker.current) {
      marker.current.position.y =
        2.55 + Math.abs(Math.sin(state.clock.elapsedTime * 3 + seed)) * 0.22
    }
  })

  return (
    <group
      ref={group}
      position={[
        npc.position[0],
        indoors ? 0 : groundHeight(...npc.position),
        npc.position[1],
      ]}
      rotation={[0, npc.facing, 0]}
    >
      <group ref={body}>
        <Character
          colors={npc.colors}
          prop={npc.prop}
          scale={npc.child ? CHILD_SCALE : 1}
          seed={seed}
          motion={motion}
          hair={npc.hair}
          dress={npc.dress}
          dressTrim={npc.dressTrim}
          blazer={npc.blazer}
          blouse={npc.blouse}
          suit={Boolean(npc.suit)}
          bowTie={npc.suit?.bowTie}
          buttonhole={npc.suit?.buttonhole}
          smile={npc.smile}
          hand={searching ? 'flashlight' : npc.hand}
          gun={Boolean(team) && !painted}
          gunColor={team === 'friend' ? PAINT.friend : PAINT.enemy}
          kit={
            team ? (team === 'friend' ? PAINT.friend : PAINT.enemy) : undefined
          }
          paint={
            painted
              ? team === 'enemy'
                ? PAINT.player
                : PAINT.enemy
              : undefined
          }
        />
      </group>
      {team && !painted && (
        <mesh
          position={[0, npc.child ? 2.62 * CHILD_SCALE : 2.62, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.3, 0.46, 14]} />
          <meshBasicMaterial
            color={team === 'friend' ? PAINT.friend : PAINT.enemy}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.5, 14]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.2} />
      </mesh>
      {feasting && (
        <ChatBubble seed={seed} scale={npc.child ? CHILD_SCALE : 1} />
      )}
      {!met && !team && !anonymous && npc.journal && (
        <Billboard>
          <group
            ref={marker}
            position={[0, npc.child ? 2.6 * CHILD_SCALE : 2.6, 0]}
            scale={1.35}
          >
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.13, 0.36, 0.02]} />
              <meshBasicMaterial color="#ffd93d" />
            </mesh>
            <mesh position={[0, -0.17, 0]}>
              <boxGeometry args={[0.13, 0.13, 0.02]} />
              <meshBasicMaterial color="#ffd93d" />
            </mesh>
            <mesh position={[0, 0.12, -0.02]}>
              <boxGeometry args={[0.21, 0.44, 0.01]} />
              <meshBasicMaterial color="#3a2a12" />
            </mesh>
            <mesh position={[0, -0.17, -0.02]}>
              <boxGeometry args={[0.21, 0.21, 0.01]} />
              <meshBasicMaterial color="#3a2a12" />
            </mesh>
          </group>
        </Billboard>
      )}
    </group>
  )
}
