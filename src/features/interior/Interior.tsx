import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BackSide, Path, Shape, ShapeGeometry } from 'three'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { INTERIOR_BY_ID } from './interiors'
import {
  DOORWAY_WIDTH,
  FLIGHT,
  FLIGHT_RISE,
  FLIGHT_RUN,
  TECH_WALL_SPAN,
  WALL_HEIGHT,
  WELL,
  roomProps,
} from './interiorLogic'
import { MONTH_NAMES, nameOfDay } from '../calendar/calendar'
import { examine } from './examine'
import { LECTURE_AREA } from '../lecture/lecture'
import { liftPhase } from '../lift/lift'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'
import { InteriorFurniture } from './InteriorProps'
import { Slides } from '../lecture/Slides'
import { Npcs } from '../npc/Npcs'
import { Player } from '../player/Player'
import { TextPlane } from '../../shared/engine/TextSign'
import { TECH_GROUPS, useMarkTexture } from '../cv/TechMarks'
import type { TechGroup, TechMark } from '../cv/TechMarks'
import type {
  Exhibit,
  Interior as InteriorData,
  InteriorLink,
  InteriorProp,
} from '../../types'

export function Interior({ id }: { id: string }) {
  const interior = INTERIOR_BY_ID.get(id)
  /* Not what has been found — what was opened on this visit. The shelf that
     swings is shut every time you walk in, whatever the journal already says
     about it. */
  const swung = useGame((s) => s.swung)
  const visit = useGame((s) => s.spawn.token)
  const christmas = useGame((s) => s.christmas)
  if (!interior) return null

  // Underground there is no sun and no sky: the light comes off whatever is
  // screwed to the joists, so it is warmer, flatter and lower.
  const under = Boolean(interior.underground)
  /** Decorated, which only one room in the house ever is. */
  const festive = christmas && Boolean(interior.festive)

  return (
    <>
      {/*
        Christmas evening is lit down rather than up. The flat fill that makes
        an ordinary room readable is exactly what kills a cosy one, so on the
        day the ambient, the sky and both suns come almost all the way off and
        the room is lit by the things in it instead: the hearth, the tree, and
        a warm pool over the table. Dark between them is the point.
      */}
      <color
        attach="background"
        args={[festive ? '#0c0910' : under ? '#120f18' : '#1b1622']}
      />
      <ambientLight
        intensity={festive ? 0.2 : under ? 0.62 : 0.9}
        color={festive ? '#ffd0a0' : '#ffffff'}
      />
      <hemisphereLight
        args={
          festive
            ? ['#ffcf9a', '#1b1420', 0.22]
            : under
              ? ['#ffe0b4', '#2b2536', 0.5]
              : ['#fff4e2', '#4a4152', 0.7]
        }
      />
      <directionalLight
        position={[8, 18, 10]}
        intensity={festive ? 0.16 : under ? 0.55 : 1.1}
        color={festive ? '#ffdcb0' : under ? '#ffe6c0' : '#fff2dd'}
      />
      <directionalLight
        position={[-10, 14, -8]}
        intensity={festive ? 0.1 : under ? 0.3 : 0.45}
        color={festive ? '#8a93c4' : under ? '#9fb2d8' : '#bcd4ff'}
      />
      {/* Three warm pools, tight rather than broad: over the table, off the
          tree, and one at the back so the stairs are not a black hole. The
          hearth does the rest of it, and flickers. */}
      {festive && (
        <>
          <pointLight
            position={[0, 3.6, -5]}
            intensity={30}
            distance={15}
            decay={1.9}
            color="#ffbe78"
          />
          <pointLight
            position={[-11.6, 2.4, -5]}
            intensity={15}
            distance={10}
            decay={2}
            color="#ffd08a"
          />
          <pointLight
            position={[2, 3.6, 6]}
            intensity={13}
            distance={12}
            decay={2}
            color="#ffcf96"
          />
        </>
      )}

      <Room interior={interior} />
      <InteriorFurniture props={roomProps(interior, festive)} />
      {/* Chalked on the board, and only while somebody is at the lectern. */}
      {id === LECTURE_AREA && <Slides />}
      {(interior.links ?? []).map((link) => (
        <LinkPiece
          key={link.id}
          link={link}
          accent={interior.accent}
          shown={!link.needs || swung[link.needs] === visit}
        />
      ))}
      {interior.exhibits.map((exhibit) => (
        <ExhibitPiece
          key={exhibit.id}
          exhibit={exhibit}
          accent={interior.accent}
        />
      ))}
      {!interior.building && <ExitPad interior={interior} />}
      <Npcs area={id} />
      <Player />
    </>
  )
}

/**
 * Floor, skirting and four walls — the near ones fade out of the way. The
 * front room has the doorway to the island cut in its south wall; a room
 * deeper in the building has a solid wall there, and is left by its links.
 */
function Room({ interior }: { interior: InteriorData }) {
  const [hx, hz] = interior.half
  const front = !interior.building
  const walls = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const night = useGame((s) => s.night)

  /**
   * The floor, with a hole cut for every stairwell. The shape is drawn in
   * its own x/y and then laid flat, which turns its y into -z — so a well at
   * (x, z) in the room is a hole at (x, -z) in the shape.
   */
  const floor = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-hx, -hz)
    shape.lineTo(hx, -hz)
    shape.lineTo(hx, hz)
    shape.lineTo(-hx, hz)
    shape.closePath()
    for (const link of interior.links ?? []) {
      if (link.kind !== 'stairsDown') continue
      const across = Math.abs(Math.sin(link.rotation ?? 0)) > 0.7
      const hw = across ? WELL.halfLength : WELL.halfWidth
      const hl = across ? WELL.halfWidth : WELL.halfLength
      const [wx, wz] = link.position
      const hole = new Path()
      hole.moveTo(wx - hw, -(wz - hl))
      hole.lineTo(wx + hw, -(wz - hl))
      hole.lineTo(wx + hw, -(wz + hl))
      hole.lineTo(wx - hw, -(wz + hl))
      hole.closePath()
      shape.holes.push(hole)
    }
    return new ShapeGeometry(shape)
  }, [interior, hx, hz])
  useEffect(() => () => floor.dispose(), [floor])

  useFrame(() => {
    if (!walls.current) return
    for (const wall of walls.current.children) {
      const side = wall.userData.side as string
      wall.visible =
        side === 'north'
          ? camera.position.z > -hz
          : side === 'south'
            ? camera.position.z < hz
            : side === 'east'
              ? camera.position.x < hx
              : camera.position.x > -hx
    }
  })

  const wallMat = (
    <meshStandardMaterial color={interior.wall} flatShading roughness={0.95} />
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={floor} receiveShadow>
        <meshStandardMaterial color={interior.floor} roughness={1} />
      </mesh>

      <group ref={walls}>
        {/* Windows go in the wall group so they fade with the wall they are
            cut into, rather than hanging in mid air once it goes. */}
        {(interior.windows ?? []).map((w, i) => (
          <group key={i} userData={{ side: w.side }}>
            <Window side={w.side} at={w.at} hx={hx} hz={hz} night={night} />
          </group>
        ))}
        <mesh
          userData={{ side: 'north' }}
          position={[0, WALL_HEIGHT / 2, -hz - 0.2]}
          receiveShadow
        >
          <boxGeometry args={[hx * 2 + 0.8, WALL_HEIGHT, 0.4]} />
          {wallMat}
        </mesh>
        <mesh
          userData={{ side: 'east' }}
          position={[hx + 0.2, WALL_HEIGHT / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.4, WALL_HEIGHT, hz * 2 + 0.8]} />
          {wallMat}
        </mesh>
        <mesh
          userData={{ side: 'west' }}
          position={[-hx - 0.2, WALL_HEIGHT / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.4, WALL_HEIGHT, hz * 2 + 0.8]} />
          {wallMat}
        </mesh>
        {/* South wall, split around the doorway in the front room only. */}
        {front ? (
          <group userData={{ side: 'south' }}>
            {[-1, 1].map((sign) => {
              const width = hx - DOORWAY_WIDTH / 2
              return (
                <mesh
                  key={sign}
                  position={[
                    sign * (DOORWAY_WIDTH / 2 + width / 2),
                    WALL_HEIGHT / 2,
                    hz + 0.2,
                  ]}
                  receiveShadow
                >
                  <boxGeometry args={[width, WALL_HEIGHT, 0.4]} />
                  {wallMat}
                </mesh>
              )
            })}
            <mesh position={[0, WALL_HEIGHT - 0.5, hz + 0.2]}>
              <boxGeometry args={[DOORWAY_WIDTH, 1, 0.4]} />
              {wallMat}
            </mesh>
          </group>
        ) : (
          <mesh
            userData={{ side: 'south' }}
            position={[0, WALL_HEIGHT / 2, hz + 0.2]}
            receiveShadow
          >
            <boxGeometry args={[hx * 2 + 0.8, WALL_HEIGHT, 0.4]} />
            {wallMat}
          </mesh>
        )}
      </group>

      {/* Down here the ceiling is the floor above: joists, and a strip
          light screwed between them every so often. */}
      {interior.underground && (
        <group>
          {Array.from({ length: Math.round(hx / 2.6) * 2 + 1 }, (_, i) => {
            const x = (i - Math.round(hx / 2.6)) * 2.6
            return (
              <mesh key={i} position={[x, WALL_HEIGHT - 0.24, 0]}>
                <boxGeometry args={[0.28, 0.46, hz * 2]} />
                <meshStandardMaterial
                  color="#8a6f4e"
                  flatShading
                  roughness={1}
                />
              </mesh>
            )
          })}
          {/* Four of them, not six. Every one is a point light the shader has
              to walk per pixel, and the ambient down here is doing most of
              the work anyway. */}
          {[-hz * 0.45, hz * 0.5].map((z, i) =>
            [-hx * 0.5, hx * 0.5].map((x) => (
              <group key={`${i}${x}`} position={[x, WALL_HEIGHT - 0.62, z]}>
                <mesh>
                  <boxGeometry args={[2.6, 0.14, 0.34]} />
                  <meshStandardMaterial
                    color="#fff3d4"
                    emissive="#ffe6b0"
                    emissiveIntensity={1.5}
                    toneMapped={false}
                  />
                </mesh>
                <pointLight
                  position={[0, -0.5, 0]}
                  intensity={34}
                  distance={22}
                  color="#ffdfae"
                />
              </group>
            )),
          )}
        </group>
      )}

      {/* Skirting picks out the room's accent colour */}
      {[
        { p: [0, 0.16, -hz - 0.02] as const, a: [hx * 2, 0.32, 0.16] as const },
        { p: [hx + 0.02, 0.16, 0] as const, a: [0.16, 0.32, hz * 2] as const },
        { p: [-hx - 0.02, 0.16, 0] as const, a: [0.16, 0.32, hz * 2] as const },
      ].map((s, i) => (
        <mesh key={i} position={[...s.p]}>
          <boxGeometry args={[...s.a]} />
          <meshStandardMaterial color={interior.accent} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/** The ring on the floor of the front doorway. Step into it and you are out. */
function ExitPad({ interior }: { interior: InteriorData }) {
  const ring = useRef<Mesh>(null)
  const t = useT()
  const z = interior.half[1] - 1.8

  useFrame((state) => {
    if (!ring.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 2.4) + 1) / 2
    ring.current.scale.setScalar(1 + pulse * 0.08)
  })

  return (
    <group position={[0, 0, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.1, 1.6, 28]} />
        <meshBasicMaterial
          color="#ffd166"
          transparent
          opacity={0.75}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>
      <TextPlane
        text={t('Way out')}
        width={3}
        aspect={4.4}
        color="#ffe9c4"
        outline="rgba(0,0,0,0.6)"
        position={[0, 3.4, 0]}
      />
    </group>
  )
}

/* ---------------------------- the exhibits --------------------------- */

function ExhibitPiece({
  exhibit,
  accent,
}: {
  exhibit: Exhibit
  accent: string
}) {
  const taken = useGame((s) =>
    exhibit.keyId ? Boolean(s.keys[exhibit.keyId]) : false,
  )
  const active = useGame((s) => s.nearby?.id === exhibit.id)

  return (
    <>
      {/* The thing you click, when the exhibit is a thing rather than a
          board: an invisible box sitting on the real object across the room
          from the prompt — the toy on its shelf, the globe on its stand. It
          is given in room coordinates of its own because the prop it covers
          belongs to the furniture of the room, not to this group. */}
      {exhibit.hitbox && <ExhibitHitbox exhibit={exhibit} accent={accent} />}
      <group
        position={[exhibit.position[0], 0, exhibit.position[1]]}
        rotation={[0, exhibit.rotation ?? 0, 0]}
      >
        {exhibit.kind === 'key' ? (
          <KeyStand taken={taken} active={active} accent={accent} />
        ) : exhibit.kind === 'case' ? (
          <DisplayCase accent={accent} />
        ) : exhibit.kind === 'terminal' ? (
          <Terminal accent={accent} />
        ) : exhibit.kind === 'radio' ? (
          <Transmitter accent={accent} />
        ) : exhibit.kind === 'cv' ? (
          <Logbook accent={accent} />
        ) : exhibit.kind === 'calendar' ? (
          <WallCalendar />
        ) : exhibit.kind === 'techWall' ? (
          <TechWall accent={accent} />
        ) : exhibit.kind === 'toy' || exhibit.kind === 'prop' ? null : (
          <NoticeBoard accent={accent} />
        )}
        {active && <Halo accent={accent} />}
      </group>
    </>
  )
}

/**
 * The clickable box over a prop — a toy, or the globe. Invisible, but it
 * takes the pointer: hovering it puts the hand cursor up and clicking it does
 * exactly what walking over and pressing Enter does, because both call
 * `examine`.
 *
 * The cursor is reset on unmount as well as on pointer-out — leaving the room
 * with the pointer still over it would otherwise leave the hand cursor up
 * over the whole island.
 */
function ExhibitHitbox({
  exhibit,
  accent,
}: {
  exhibit: Exhibit
  accent: string
}) {
  const area = useGame((s) => s.area)
  const name = INTERIOR_BY_ID.get(area)?.name ?? ''
  const box = exhibit.hitbox!
  const hovered = useRef(false)

  const cursor = (on: boolean) => {
    hovered.current = on
    document.body.style.cursor = on ? 'pointer' : ''
  }
  useEffect(
    () => () => {
      if (hovered.current) document.body.style.cursor = ''
    },
    [],
  )

  return (
    <mesh
      position={[box.at[0], box.y, box.at[1]]}
      visible={false}
      onPointerOver={(e) => {
        e.stopPropagation()
        cursor(true)
      }}
      onPointerOut={() => cursor(false)}
      onClick={(e) => {
        e.stopPropagation()
        cursor(false)
        examine(exhibit, accent, name)
      }}
    >
      {/* Never drawn — `visible` false keeps it out of the render entirely,
          while three still raycasts it, so it cannot tint or occlude the toy
          it sits on. */}
      <boxGeometry args={[box.size * 2, box.size * 2, box.size * 2]} />
      <meshBasicMaterial />
    </mesh>
  )
}

/**
 * The calendar on the basement wall. A block with the month across the head
 * of it and the day underneath, big enough to read from the middle of the
 * room — it is the only thing in the house that tells you what day it is, and
 * the only thing that decides.
 *
 * It reads whatever it has been turned to, so walking back in on the
 * twenty-fifth finds it still on the twenty-fifth.
 */
function WallCalendar() {
  const date = useGame((s) => s.calendar)
  const festive = useGame((s) => s.christmas)
  const t = useT()
  const named = nameOfDay(date)
  return (
    <group position={[0, 3, 0]}>
      {/* Backing board and the nail it hangs off. */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 2.1, 0.1]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.63, 0.07]}>
        <planeGeometry args={[1.32, 0.46]} />
        <meshStandardMaterial
          color={festive ? '#b5442f' : '#2f6fa8'}
          roughness={0.85}
        />
      </mesh>
      <mesh position={[0, -0.28, 0.07]}>
        <planeGeometry args={[1.32, 1.3]} />
        <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
      </mesh>
      <TextPlane
        text={t(MONTH_NAMES[date.month - 1])}
        width={1.24}
        aspect={5.2}
        color="#fff6e2"
        position={[0, 0.63, 0.09]}
      />
      <TextPlane
        text={String(date.day)}
        width={0.8}
        aspect={1.15}
        color="#33302c"
        position={[0, -0.1, 0.09]}
      />
      {/* And whose day it is, for the two in the year that are somebody's. */}
      {named && (
        <TextPlane
          text={t(named)}
          width={1.24}
          aspect={8.4}
          color={festive ? '#a3352a' : '#2f6fa8'}
          outline="rgba(255,255,255,0)"
          position={[0, -0.78, 0.09]}
        />
      )}
    </group>
  )
}

function Halo({ accent }: { accent: string }) {
  const ring = useRef<Mesh>(null)
  useFrame((state) => {
    if (ring.current) {
      ring.current.rotation.z = state.clock.elapsedTime * 0.8
    }
  })
  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
      <ringGeometry args={[1.1, 1.4, 24, 1, 0, Math.PI * 1.5]} />
      <meshBasicMaterial
        color={accent}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ------------------------- the technology wall ------------------------ */

/**
 * The wall's measurements, in metres of room.
 *
 * A row is built downwards out of four fixed bands — heading, gap, plate,
 * name — rather than out of one pitch with the pieces hung off it by eye. The
 * heading is a fixed height whatever its group is called, so a five-mark
 * group's heading cannot grow into the row above it the way a plane scaled to
 * its group's width does.
 */
const TECH_WALL_WIDTH = TECH_WALL_SPAN
/** One mark's plate, and the spacing from one plate to the next along a row. */
const TECH_TILE = 0.72
const TECH_TILE_PITCH = 1.28
/** The bands a row is made of, top to bottom. */
const TECH_HEAD_H = 0.24
/**
 * How wide a heading's plane is allowed to get. TextPlane draws onto a canvas
 * of fixed width and an aspect-derived height, so a plane stretched to a
 * seven-mark group's full run would be a couple of dozen pixels tall and set
 * its type far too small to read. Capped, a wide group's heading simply sits
 * centred over its run at the same size as every other heading.
 */
const TECH_HEAD_W = 2.6
const TECH_NAME_H = 0.2
const TECH_GAP = 0.09
/** One row's full height, and the drop from one row's top to the next's. */
const TECH_ROW_H =
  TECH_HEAD_H + TECH_GAP + TECH_TILE + TECH_GAP * 0.6 + TECH_NAME_H
const TECH_ROW_PITCH = TECH_ROW_H + 0.24
/** The title strip across the head of the board, and the margin under it. */
const TECH_ROW_TOP = 0.62
/** Three rows, the title strip, and a margin at the foot. */
const TECH_WALL_HEIGHT = 0.26 + 3 * TECH_ROW_PITCH + 0.34
/**
 * Height of the middle of the board off the floor. Sat on a low skirting and
 * held clear of the 5.4m ceiling, which the top batten would otherwise meet.
 */
const TECH_WALL_MID = 0.12 + TECH_WALL_HEIGHT / 2
/** How many marks fit across one row before the next group wraps. */
const TECH_ROW_TILES = Math.floor(TECH_WALL_WIDTH / TECH_TILE_PITCH)

/**
 * The marks on the technology wall, laid out in the rows the CV groups them
 * into. The wall is drawn in its own frame with +x running along it and its
 * face looking down +z, so the exhibit's own rotation is all that decides
 * which wall of the room it hangs on.
 */
function TechWall({ accent }: { accent: string }) {
  const t = useT()

  /**
   * Rows are packed by group: a group runs on the current row if it fits and
   * starts a new one if it does not, so the wall fills evenly whatever the
   * roster happens to hold, and a group is never split across two rows.
   */
  const rows = useMemo(() => {
    const out: TechGroup[][] = []
    let row: TechGroup[] = []
    let used = 0
    for (const group of TECH_GROUPS) {
      const width = group.marks.length
      if (row.length && used + width > TECH_ROW_TILES) {
        out.push(row)
        row = []
        used = 0
      }
      row.push(group)
      used += width
    }
    if (row.length) out.push(row)
    return out
  }, [])

  return (
    <group>
      {/* The board the marks are mounted on, and the batten framing it. */}
      <mesh position={[0, TECH_WALL_MID, -0.06]} receiveShadow>
        <boxGeometry args={[TECH_WALL_WIDTH, TECH_WALL_HEIGHT, 0.12]} />
        <meshStandardMaterial color="#2c3a42" flatShading roughness={0.92} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, TECH_WALL_MID + (side * TECH_WALL_HEIGHT) / 2, 0]}
        >
          <boxGeometry args={[TECH_WALL_WIDTH, 0.14, 0.18]} />
          <meshStandardMaterial color={accent} flatShading roughness={0.6} />
        </mesh>
      ))}

      <TextPlane
        text={t('Everything it is built out of')}
        width={7}
        aspect={9}
        color="#eaf6f2"
        outline="rgba(0,0,0,0.55)"
        position={[0, TECH_WALL_MID + TECH_WALL_HEIGHT / 2 - 0.3, 0.12]}
      />

      {rows.map((row, r) => {
        // Each row is centred on its own run of tiles, so a short row sits in
        // the middle of the wall rather than hanging off the left edge.
        const tiles = row.reduce((n, g) => n + g.marks.length, 0)
        const span = tiles * TECH_TILE_PITCH
        // The top edge of this row's heading band. Everything in the row is
        // measured down from here, band by band.
        const top =
          TECH_WALL_MID +
          TECH_WALL_HEIGHT / 2 -
          TECH_ROW_TOP -
          r * TECH_ROW_PITCH
        let i = 0

        return (
          <group key={r} position={[0, top, 0]}>
            {row.map((group) => {
              const start = -span / 2 + i * TECH_TILE_PITCH
              const mid = start + (group.marks.length * TECH_TILE_PITCH) / 2
              const rule = group.marks.length * TECH_TILE_PITCH * 0.9
              i += group.marks.length

              return (
                <group key={group.label}>
                  {/*
                    The heading sits in a band of its own fixed height: its
                    plane is as wide as the text needs at that height, not as
                    wide as the group, so a long label sets in smaller rather
                    than growing up into the row above.
                  */}
                  <TextPlane
                    text={t(group.label)}
                    width={Math.min(rule, TECH_HEAD_W)}
                    aspect={Math.min(rule, TECH_HEAD_W) / TECH_HEAD_H}
                    color={accent}
                    outline="rgba(0,0,0,0.5)"
                    position={[mid, -TECH_HEAD_H / 2, 0.12]}
                  />
                  <mesh position={[mid, -TECH_HEAD_H - TECH_GAP * 0.35, 0.1]}>
                    <planeGeometry args={[rule, 0.025]} />
                    <meshBasicMaterial
                      color={accent}
                      transparent
                      opacity={0.5}
                      depthWrite={false}
                    />
                  </mesh>

                  {group.marks.map((mark, m) => (
                    <TechTile
                      key={mark.id}
                      mark={mark}
                      x={start + (m + 0.5) * TECH_TILE_PITCH}
                    />
                  ))}
                </group>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

/**
 * One mark on the wall: the plate, the drawn mark, and the name under it.
 * Placed relative to the top of its row's heading band, so the row's bands
 * are the only thing that decides where it lands.
 */
function TechTile({ mark, x }: { mark: TechMark; x: number }) {
  const texture = useMarkTexture(mark.id, mark.draw)
  const centre = -TECH_HEAD_H - TECH_GAP - TECH_TILE / 2

  return (
    <group position={[x, centre, 0]}>
      {/* The plate the mark is mounted on, stood a little off the board. */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[TECH_TILE * 1.1, TECH_TILE * 1.1]} />
        <meshStandardMaterial color="#f4f7f6" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[TECH_TILE, TECH_TILE]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
      {/*
        The name is held to the tile pitch so a long one — "SAML · ADFS · JWT"
        — sets smaller inside its own slot rather than running across its
        neighbours. TextPlane shrinks the type to fit the plane it is given.
      */}
      <TextPlane
        text={mark.name}
        width={TECH_TILE_PITCH * 0.96}
        aspect={(TECH_TILE_PITCH * 0.96) / TECH_NAME_H}
        color="#dfe9ee"
        outline="rgba(0,0,0,0.6)"
        position={[0, -TECH_TILE / 2 - TECH_GAP * 0.6 - TECH_NAME_H / 2, 0.1]}
      />
    </group>
  )
}

function NoticeBoard({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[3.2, 2.2, 0.18]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 0.11]}>
        <planeGeometry args={[2.9, 1.9]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      {[
        [-0.8, 0.45],
        [0.7, 0.35],
        [-0.5, -0.35],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, 2.1 + y, 0.13]}>
          <planeGeometry args={[1.1, 0.55]} />
          <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function DisplayCase({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1, 1.2]} />
        <meshStandardMaterial color="#7d5a3a" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[2.2, 1.5, 1]} />
        <meshStandardMaterial
          color="#d8ecf5"
          transparent
          opacity={0.32}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.9, 0.5, 0.5]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.55, 0]}>
        <boxGeometry args={[2.3, 0.12, 1.1]} />
        <meshStandardMaterial color="#5c4326" flatShading />
      </mesh>
    </group>
  )
}

function Terminal({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.8, 1.1, 0.9]} />
        <meshStandardMaterial color="#3a4350" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[1.9, 1.2, 0.12]} />
        <meshStandardMaterial color="#22313f" flatShading />
      </mesh>
      <mesh position={[0, 1.63, 0.09]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[1.7, 1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

function Transmitter({ accent }: { accent: string }) {
  const dish = useRef<Group>(null)
  useFrame((state) => {
    if (dish.current) {
      dish.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.25
    }
  })
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 1.4]} />
        <meshStandardMaterial color="#4a3f57" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0.73]}>
        <planeGeometry args={[2.4, 0.9]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.6}
        />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.8, 0.73]}>
          <circleGeometry args={[0.34, 16]} />
          <meshStandardMaterial color="#2f2a38" roughness={0.8} />
        </mesh>
      ))}
      <group ref={dish} position={[0, 2.6, 0]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry
            args={[0.9, 14, 10, 0, Math.PI * 2, 0, Math.PI / 3]}
          />
          <meshStandardMaterial
            color="#f4f0f6"
            side={2}
            flatShading
            roughness={0.7}
          />
        </mesh>
      </group>
    </group>
  )
}

function Logbook({ accent }: { accent: string }) {
  const book = useRef<Group>(null)
  useFrame((state) => {
    if (book.current) {
      book.current.position.y =
        1.28 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04
    }
  })
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.6, 1.2, 1]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.24, -0.1]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.1, 1]} />
        <meshStandardMaterial color="#a97c4e" flatShading />
      </mesh>
      <group ref={book} position={[0, 1.28, 0]} rotation={[-0.4, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.16, 0.8]} />
          <meshStandardMaterial color={accent} flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.1, 0.06, 0.72]} />
          <meshStandardMaterial color="#fdf7e9" roughness={0.9} />
        </mesh>
      </group>
      <pointLight
        position={[0, 2.4, 0.6]}
        intensity={6}
        distance={7}
        color="#ffdca8"
      />
    </group>
  )
}

function KeyStand({
  taken,
  active,
  accent,
}: {
  taken: boolean
  active: boolean
  accent: string
}) {
  const key = useRef<Group>(null)
  useFrame((state) => {
    if (!key.current) return
    const t = state.clock.elapsedTime
    key.current.rotation.y = t * 1.2
    key.current.position.y = 1.7 + Math.sin(t * 1.8) * 0.12
    key.current.scale.setScalar(active ? 1.15 : 1)
  })

  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.85, 1, 10]} />
        <meshStandardMaterial color="#7d5a3a" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 10]} />
        <meshStandardMaterial color="#5c4326" flatShading />
      </mesh>

      {taken ? (
        <mesh position={[0, 1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#3d3227" roughness={1} />
        </mesh>
      ) : (
        <>
          <group ref={key} position={[0, 1.7, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.22, 0.07, 6, 14]} />
              <meshStandardMaterial
                color="#f0c14b"
                metalness={0.7}
                roughness={0.28}
                emissive="#8a6a10"
                emissiveIntensity={0.35}
              />
            </mesh>
            <mesh position={[0, -0.45, 0]} castShadow>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial
                color="#f0c14b"
                metalness={0.7}
                roughness={0.28}
              />
            </mesh>
            {[-0.62, -0.75].map((y) => (
              <mesh key={y} position={[0.16, y, 0]}>
                <boxGeometry args={[0.24, 0.1, 0.1]} />
                <meshStandardMaterial
                  color="#f0c14b"
                  metalness={0.7}
                  roughness={0.28}
                />
              </mesh>
            ))}
          </group>
          <pointLight
            position={[0, 1.8, 0]}
            intensity={5}
            distance={6}
            color={accent}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[1, 1.35, 24]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

/* --------------------------- windows and ways --------------------------- */

/**
 * A window, and the outside coming through it. There is no real world behind
 * it, so the pane is simply lit — daylight or a night sky, whichever hour it
 * is out there.
 */
function Window({
  side,
  at,
  hx,
  hz,
  night,
}: {
  side: 'north' | 'east' | 'west'
  at: number
  hx: number
  hz: number
  night: boolean
}) {
  const glass = night ? '#26375e' : '#cfeaf7'
  const glow = night ? 0.35 : 1.15
  const along = side === 'north' ? at * hx : at * hz
  // The wall's inner face. Everything here is measured back from it into the
  // wall, so the window is a hole with something in it rather than a slab
  // stuck to the surface — which from any angle but straight on read as a
  // panel hanging in the room.
  const position: [number, number, number] =
    side === 'north'
      ? [along, 2.9, -hz]
      : side === 'east'
        ? [hx, 2.9, along]
        : [-hx, 2.9, along]
  const turn =
    side === 'north' ? 0 : side === 'east' ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={position} rotation={[0, turn, 0]}>
      {/*
        The reveal: the four faces of the hole through the wall, drawn as a
        box seen from inside so the wall appears to have real thickness.

        Nothing else here shares a plane with it. Two faces at the same depth
        flicker in bands as the camera moves, so the glass is set well back
        from the mouth and a little narrower than the hole, and the surround
        stands clear in front of it rather than landing on its front edge.
      */}
      <mesh position={[0, 0, -0.22]}>
        <boxGeometry args={[3.1, 2.3, 0.44]} />
        <meshStandardMaterial
          color="#e8e0cf"
          flatShading
          roughness={0.95}
          side={BackSide}
        />
      </mesh>
      {/* The glass, inset from the reveal on every side so its edges never
          meet the reveal's own walls, and short of the back of it. */}
      <mesh position={[0, 0, -0.38]}>
        <planeGeometry args={[2.96, 2.16]} />
        <meshStandardMaterial
          color={glass}
          emissive={glass}
          emissiveIntensity={glow}
          toneMapped={false}
        />
      </mesh>
      {/* Glazing bars, a clear gap in front of the pane. */}
      <mesh position={[0, 0, -0.31]}>
        <boxGeometry args={[0.1, 2.16, 0.05]} />
        <meshStandardMaterial color="#f7f2e6" flatShading />
      </mesh>
      <mesh position={[0, 0, -0.31]}>
        <boxGeometry args={[2.96, 0.1, 0.05]} />
        <meshStandardMaterial color="#f7f2e6" flatShading />
      </mesh>
      {/* The surround, standing just proud of the wall face rather than
          flush with it: flush put its back on the reveal's front edge. */}
      {[
        { p: [-1.62, 0, 0.05] as const, a: [0.24, 2.74, 0.1] as const },
        { p: [1.62, 0, 0.05] as const, a: [0.24, 2.74, 0.1] as const },
        { p: [0, 1.27, 0.05] as const, a: [3.48, 0.24, 0.1] as const },
      ].map((bar, i) => (
        <mesh key={i} position={[...bar.p]}>
          <boxGeometry args={[...bar.a]} />
          <meshStandardMaterial color="#f7f2e6" flatShading roughness={0.9} />
        </mesh>
      ))}
      {/* The sill, which stands out further still. */}
      <mesh position={[0, -1.29, 0.1]}>
        <boxGeometry args={[3.66, 0.18, 0.34]} />
        <meshStandardMaterial color="#e6dcc6" flatShading roughness={0.9} />
      </mesh>
      <pointLight
        position={[0, 0, 1.6]}
        intensity={night ? 6 : 22}
        distance={night ? 9 : 18}
        color={glass}
      />
    </group>
  )
}

/**
 * The stairs, the door nobody has the key to, and the shelf that swings. Each
 * one is drawn on its wall with a sign over it saying where it goes, and is
 * taken by walking into it — so there is no prompt and no ring to wait for.
 */
function LinkPiece({
  link,
  accent,
  shown,
}: {
  link: InteriorLink
  accent: string
  shown: boolean
}) {
  const t = useT()
  const dest = link.to ? INTERIOR_BY_ID.get(link.to) : undefined
  const camera = useThree((s) => s.camera)
  const piece = useRef<Group>(null)
  /* A door or shelf standing in the south wall goes with the wall when the
     wall fades out of the camera's way: at full height it would otherwise be
     the one thing left standing between you and the room. The stairs stay,
     being low enough to see over and the thing you came to find. */
  const fades =
    link.kind !== 'stairsUp' &&
    link.kind !== 'stairsDown' &&
    Math.cos(link.rotation ?? 0) < -0.7
  useFrame(() => {
    if (!piece.current || !fades) return
    piece.current.visible = camera.position.z < link.position[1]
  })
  /* Until the secret is out, the shelf that swings is a shelf like the
     others in the run: nothing about it says otherwise. */
  const shut = useMemo<InteriorProp[]>(
    () => [
      {
        kind: 'bookshelf',
        position: link.position,
        rotation: link.rotation,
        solid: false,
      },
    ],
    [link],
  )
  if (!shown) {
    return link.kind === 'hatch' ? <InteriorFurniture props={shut} /> : null
  }

  return (
    <group
      position={[link.position[0], 0, link.position[1]]}
      rotation={[0, link.rotation ?? 0, 0]}
    >
      <group ref={piece}>
        {link.kind === 'stairsDown' ? (
          <Stairwell />
        ) : link.kind === 'stairsUp' ? (
          <UpFlight />
        ) : link.kind === 'locked' ? (
          <ShutDoor accent={accent} />
        ) : link.kind === 'lift' ? (
          <LiftDoors link={link} accent={accent} />
        ) : link.kind === 'door' ? (
          <OpenDoor accent={accent} />
        ) : (
          <SwungShelf accent={accent} />
        )}
      </group>
      {/*
        A lit sill on the floor of the opening, which never fades.

        The piece above it is allowed to drop out of the camera's way, and for
        a door in the south wall that means turning to face it makes it
        vanish — fine for a wall, useless for the only way out of a room. The
        threshold is flat on the ground, so it can never be in the way, and it
        is what actually marks the opening from inside.
      */}
      {link.kind === 'hatch' && <Threshold accent={accent} />}
      {/* Where it goes, over the top of it. The secret room's shelf keeps
          its own counsel: the sign just says you can get through. */}
      {link.kind !== 'locked' && link.kind !== 'lift' && (
        <TextPlane
          text={t(link.kind === 'hatch' || !dest ? 'Through' : dest.kicker)}
          width={link.kind === 'hatch' || !dest ? 2.2 : 4.6}
          aspect={link.kind === 'hatch' || !dest ? 3.4 : 7}
          color="#ffe9c4"
          outline="rgba(0,0,0,0.6)"
          position={[0, 4.35, 0.3]}
        />
      )}
    </group>
  )
}

/**
 * A hole in the floor with steps going into it. The floor is a single plane
 * and cannot be cut, so this is a dark box sunk into it with the treads
 * drawn inside — which from a camera that never gets below the ceiling is
 * indistinguishable from the real thing.
 */
function Stairwell() {
  const glow = useRef<Mesh>(null)
  useFrame((state) => {
    if (!glow.current) return
    const material = glow.current.material as { opacity: number }
    const pulse = (Math.sin(state.clock.elapsedTime * 2.2) + 1) / 2
    material.opacity = 0.3 + pulse * 0.12
  })

  return (
    <group>
      {/* The shaft, drawn inside out. A normal box has a lid on it, and
          that lid sat flush over the opening hiding every tread below it, so
          the stairs read as a dark rug on the floor. Back faces only culls
          the top as you look down and leaves you looking into the hole. */}
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[3, 2.9, 3.4]} />
        <meshStandardMaterial
          color="#231d29"
          flatShading
          roughness={1}
          side={BackSide}
        />
      </mesh>
      {/* Treads down the near half, so it reads as descending and not as a pit. */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, -0.24 - i * 0.34, 1.3 - i * 0.52]}>
          <boxGeometry args={[2.9, 0.2, 0.56]} />
          <meshStandardMaterial color="#c3b393" flatShading roughness={0.95} />
        </mesh>
      ))}
      {/* Warm light coming up out of it. */}
      <mesh
        ref={glow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, -0.4]}
      >
        <planeGeometry args={[2.8, 2.4]} />
        <meshBasicMaterial
          color="#ffca7a"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        position={[0, -0.9, 0]}
        intensity={9}
        distance={7}
        color="#ffca7a"
      />
      {/* Newel posts and a handrail down one side. */}
      {[-1.62, 1.62].map((x) => (
        <mesh key={x} position={[x, 0.56, 1.7]} castShadow>
          <boxGeometry args={[0.16, 1.12, 0.16]} />
          <meshStandardMaterial color="#7d5a3a" flatShading />
        </mesh>
      ))}
      <mesh position={[-1.62, 0.98, 0.3]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 3.1]} />
        <meshStandardMaterial color="#7d5a3a" flatShading />
      </mesh>
      <mesh position={[1.62, 0.98, 0.3]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 3.1]} />
        <meshStandardMaterial color="#7d5a3a" flatShading />
      </mesh>
    </group>
  )
}

/** The door down the hall. It does not open, and it is meant to look like it. */
/** One leaf of the lift doors, with its edge rail on the meeting side. */
function LiftLeaf({ handed }: { handed: number }) {
  return (
    <group>
      <mesh position={[0, 1.72, 0]} castShadow>
        <boxGeometry args={[1.3, 3.36, 0.14]} />
        <meshStandardMaterial
          color="#b9c2cb"
          flatShading
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>
      <mesh position={[handed * -0.6, 1.72, 0.08]}>
        <boxGeometry args={[0.06, 3.3, 0.04]} />
        <meshStandardMaterial color="#79828d" flatShading metalness={0.6} />
      </mesh>
    </group>
  )
}

/**
 * The lift. Two leaves that slide into the jamb, a lit floor indicator over
 * them, and a call panel down the side with a button per floor.
 *
 * The doors are drawn from the ride on the store rather than from a local
 * animation, so the car you are standing in and the number counting over your
 * head can never disagree — see game/lift.ts, which owns the timing.
 *
 * Standing on a floor with no ride under way, the doors are open: this is
 * both the car you get into and the opening you get out of.
 */
function LiftDoors({ link, accent }: { link: InteriorLink; accent: string }) {
  const leftLeaf = useRef<Group>(null)
  const rightLeaf = useRef<Group>(null)
  const lamp = useRef<MeshBasicMaterial>(null)
  const [floor, setFloor] = useState(link.floor ?? 0)

  useFrame(() => {
    const { lift: ride, area } = useGame.getState()
    /*
     * Only the car he is actually riding moves. The lift on every other floor
     * stands with its doors open, waiting to be called.
     *
     * "His" is the car in the room he is in, not the link the ride started
     * on: every floor gives its own lift its own id, and the room swaps to
     * the far floor the moment the car stops. Matching on `linkId` alone left
     * the arrival floor's leaves outside the ride entirely, so they mounted
     * wide and the opening was never drawn — the half of the animation that
     * was missing.
     */
    const mine = ride && (ride.linkId === link.id || area === ride.toRoom)
    const phase = mine
      ? liftPhase(ride, performance.now() / 1000)
      : { open: 1, floor: link.floor ?? 0, done: true, arrived: true, t: 1 }
    const slide = 0.62 + (1 - phase.open) * 0.62
    if (leftLeaf.current) leftLeaf.current.position.x = -slide
    if (rightLeaf.current) rightLeaf.current.position.x = slide
    if (lamp.current) {
      /* Brightest while it is moving: the indicator is the only thing in the
         car that tells you anything is happening. */
      lamp.current.opacity = phase.open < 0.5 ? 1 : 0.55
    }
    /* The only thing here allowed to re-render, and only when the number
       over the doors actually changes: once or twice a ride. */
    setFloor((was) => (was === phase.floor ? was : phase.floor))
  })

  return (
    <group>
      {/* The shaft behind the doors, so an open car is a hole and not a wall. */}
      <mesh position={[0, 1.75, -0.45]}>
        <boxGeometry args={[2.5, 3.5, 0.9]} />
        <meshStandardMaterial color="#1b2026" flatShading roughness={1} />
      </mesh>
      {/* The jamb. */}
      <mesh position={[0, 1.8, 0.06]}>
        <boxGeometry args={[3.4, 3.9, 0.3]} />
        <meshStandardMaterial
          color="#79828d"
          flatShading
          roughness={0.55}
          metalness={0.4}
        />
      </mesh>
      {/* Two leaves, brushed steel, sliding apart into the jamb. */}
      <group ref={leftLeaf} position={[-0.62, 0, 0.2]}>
        <LiftLeaf handed={-1} />
      </group>
      <group ref={rightLeaf} position={[0.62, 0, 0.2]}>
        <LiftLeaf handed={1} />
      </group>
      {/*
        The indicator: the floor it is passing, lit over the doors.

        Three surfaces within a centimetre of one another, so each is given a
        depth of its own and only the housing writes any. The lamp used to sit
        exactly on the housing's front face, which left the two fighting for
        every pixel — the number broke up into green confetti as the camera
        moved. Now the housing is opaque and owns the depth buffer here; the
        lamp and the digit lie in front of it, write nothing, and are ordered
        between themselves by renderOrder rather than by a 2mm gap that
        transparency sorting was free to resolve either way.
      */}
      <mesh position={[0, 3.62, 0.24]}>
        <boxGeometry args={[1.1, 0.5, 0.12]} />
        <meshStandardMaterial color="#141a1f" flatShading />
      </mesh>
      <mesh position={[0, 3.62, 0.315]} renderOrder={1}>
        <planeGeometry args={[1.02, 0.42]} />
        <meshBasicMaterial
          ref={lamp}
          color={accent}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      {/* The digit last, so it reads over the lit panel rather than under it. */}
      <TextPlane
        text={String(floor)}
        width={0.5}
        aspect={1}
        color={accent}
        position={[0, 3.62, 0.33]}
        renderOrder={2}
      />
      {/* The call panel, down the jamb on the right. */}
      <mesh position={[1.42, 1.5, 0.24]}>
        <boxGeometry args={[0.3, 0.9, 0.1]} />
        <meshStandardMaterial color="#5c646d" flatShading metalness={0.5} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[1.42, 1.15 + i * 0.3, 0.3]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 10]} />
          <meshStandardMaterial
            color={i === 2 ? '#3a4048' : accent}
            flatShading
            emissive={i === 2 ? '#000000' : accent}
            emissiveIntensity={i === 2 ? 0 : 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

function ShutDoor({ accent }: { accent: string }) {
  return (
    <group>
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[2.4, 3.4, 0.22]} />
        <meshStandardMaterial color="#8a6642" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.68, 0.12]}>
        <boxGeometry args={[1.9, 3, 0.08]} />
        <meshStandardMaterial color="#a97c4e" flatShading roughness={0.9} />
      </mesh>
      {/* Two panels, a handle, and a keyhole with nothing behind it. */}
      {[2.42, 0.96].map((y) => (
        <mesh key={y} position={[0, y, 0.17]}>
          <boxGeometry args={[1.4, 1.1, 0.04]} />
          <meshStandardMaterial color="#8f6741" flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0.72, 1.62, 0.22]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial color="#d8b25c" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.72, 1.3, 0.19]}>
        <boxGeometry args={[0.14, 0.2, 0.05]} />
        <meshStandardMaterial color="#2b2119" flatShading />
      </mesh>
      <mesh position={[0, 3.52, 0.06]}>
        <boxGeometry args={[2.6, 0.2, 0.34]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.85} />
      </mesh>
    </group>
  )
}

/**
 * The floor of a hatch opening: a warm sill with the far room's colour
 * washing over it, drawn flat so nothing can hide it.
 *
 * It is the one part of a secret door that is always readable. Everything
 * standing up out of the floor is subject to the camera fade; this is not,
 * so from inside the playroom there is always something on the ground saying
 * the way out is here.
 */
function Threshold({ accent }: { accent: string }) {
  const glow = useRef<MeshBasicMaterial>(null)
  useFrame((state) => {
    if (!glow.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 1.8) + 1) / 2
    glow.current.opacity = 0.34 + pulse * 0.16
  })
  return (
    <group>
      {/* The sill itself: a board across the opening, proud of the floor. */}
      <mesh position={[0, 0.05, 0.08]} receiveShadow>
        <boxGeometry args={[2.5, 0.1, 0.66]} />
        <meshStandardMaterial color="#6f5a3e" flatShading roughness={0.95} />
      </mesh>
      {/* Light spilling out of the opening onto it. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0.42]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshBasicMaterial
          ref={glow}
          color={accent}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * The bookshelf that turned out to be a door, standing open.
 *
 * Built like the doorway next to it rather than like a prop: a dark recess
 * cut into the wall with the far room's light hanging in it, a lining round
 * the opening, and the shelf itself swung out into the room on a hinge that
 * is actually drawn. The books are still on it, because whoever fitted the
 * hinge did not clear the shelf first.
 *
 * It reads from both sides. From the library it is the way in, so the pivot
 * carries the shelf clear of the opening; from the playroom the same piece
 * is the way out, which is the only thing in that room you are looking for.
 */
function SwungShelf({ accent }: { accent: string }) {
  return (
    <group>
      {/*
        The opening. A recess rather than a plane, so the wall reads as
        having thickness and there is somewhere for the light to come from.
        The wash sits just clear of the back face: level with it the two
        fight for the same depth and the panel strobes.
      */}
      <mesh position={[0, 1.6, -0.16]}>
        <boxGeometry args={[2.5, 3.2, 0.32]} />
        <meshStandardMaterial color="#17121f" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 1.58, -0.12]}>
        <planeGeometry args={[2.36, 3.04]} />
        <meshBasicMaterial color="#b9a2ff" transparent opacity={0.2} />
      </mesh>

      {/* The lining: two jambs and a head, in the plaster of the wall. The
          head is deliberately plain — a secret door does not get an
          architrave, or it would have been found years ago. */}
      {[-1.38, 1.38].map((x) => (
        <mesh key={x} position={[x, 1.65, 0.05]} castShadow>
          <boxGeometry args={[0.26, 3.5, 0.3]} />
          <meshStandardMaterial color="#e6dcc6" flatShading roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 3.32, 0.05]} castShadow>
        <boxGeometry args={[3.02, 0.26, 0.3]} />
        <meshStandardMaterial color="#e6dcc6" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.52, 0.05]}>
        <boxGeometry args={[3.16, 0.14, 0.36]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.85} />
      </mesh>

      {/*
        The shelf, hung off the left jamb and swung into the room. The group
        sits on the hinge line and the carcass hangs off it, so however far
        it is opened the hinge edge stays welded to the frame — the same
        trick the door next door uses.
      */}
      <group position={[-1.38, 0, 0.22]} rotation={[0, 1.02, 0]}>
        <group position={[1.3, 0, 0.22]}>
          {/* Carcass: a back, two ends and the boards between them. */}
          <mesh position={[0, 1.6, -0.16]} castShadow>
            <boxGeometry args={[2.6, 3.2, 0.12]} />
            <meshStandardMaterial
              color="#6f4f33"
              flatShading
              roughness={0.95}
            />
          </mesh>
          {[-1.24, 1.24].map((x) => (
            <mesh key={x} position={[x, 1.6, 0.04]} castShadow>
              <boxGeometry args={[0.12, 3.2, 0.52]} />
              <meshStandardMaterial
                color="#8a6642"
                flatShading
                roughness={0.95}
              />
            </mesh>
          ))}
          {[0.12, 0.86, 1.6, 2.34, 3.08].map((y) => (
            <mesh key={y} position={[0, y, 0.04]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.1, 0.52]} />
              <meshStandardMaterial
                color="#8a6642"
                flatShading
                roughness={0.95}
              />
            </mesh>
          ))}

          {/* Books, still on it, leaning the way books do on a shelf that
              has just been swung through ninety degrees. */}
          {[0.86, 1.6, 2.34].map((y, row) =>
            Array.from({ length: 8 }, (_, i) => (
              <mesh
                key={`${y}-${i}`}
                position={[-1.05 + i * 0.29, y + 0.36, 0.06]}
                rotation={[0, 0, i === 7 ? 0.22 : 0]}
                scale={[1, 0.72 + ((i * 5 + row * 3) % 4) * 0.1, 1]}
                castShadow
              >
                <boxGeometry args={[0.22, 0.58, 0.34]} />
                <meshStandardMaterial
                  color={
                    ['#8c4b3a', '#3f5f8a', '#5d7a4a', '#8a7233', '#6b4a72'][
                      (i + row) % 5
                    ]
                  }
                  flatShading
                  roughness={0.9}
                />
              </mesh>
            )),
          )}
        </group>

        {/* The hinges, which are the whole story of this thing: somebody
            fitted these on purpose and then put books in front of them. */}
        {[0.6, 1.6, 2.6].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.3, 8]} />
            <meshStandardMaterial
              color="#6f6152"
              metalness={0.6}
              roughness={0.45}
            />
          </mesh>
        ))}
      </group>

      {/* The light out of the room behind, cool against the warm house so
          the opening reads as somewhere else rather than as a shadow. */}
      <pointLight
        position={[0, 1.7, 0.5]}
        intensity={9}
        distance={8}
        color="#a98fe0"
      />
    </group>
  )
}

/**
 * A doorway between two rooms of the same building: a lined opening with the
 * next room's light coming through it, and the door itself standing open
 * against the wall. Nobody in this house shuts an internal door.
 */
function OpenDoor({ accent }: { accent: string }) {
  return (
    <group>
      {/*
        The opening: a dark recess with a warm wash hanging in it. There is
        no geometry behind it, and at this camera angle there does not need
        to be.

        The wash is a plane, so it has to keep a clear gap from the face
        behind it and stay inside its edges — level with it, the two fight
        for the same depth and a band of light strobes across the doorway.
      */}
      <mesh position={[0, 1.7, -0.14]}>
        <boxGeometry args={[2.2, 3.4, 0.28]} />
        <meshStandardMaterial color="#1d1822" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 1.66, -0.11]}>
        <planeGeometry args={[2.06, 3.22]} />
        <meshBasicMaterial color="#ffca7a" transparent opacity={0.16} />
      </mesh>
      {/* Lining: two jambs and a head. */}
      {[-1.24, 1.24].map((x) => (
        <mesh key={x} position={[x, 1.75, 0.06]} castShadow>
          <boxGeometry args={[0.28, 3.7, 0.34]} />
          <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.5, 0.06]} castShadow>
        <boxGeometry args={[2.76, 0.28, 0.34]} />
        <meshStandardMaterial color="#f2ece0" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.72, 0.06]}>
        <boxGeometry args={[2.9, 0.16, 0.4]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.85} />
      </mesh>
      {/*
        The door, standing open on its hinge.

        It swings about the inner face of the right-hand jamb rather than
        floating somewhere beside it: the group sits on the hinge line and
        the leaf hangs off it, so however far it is opened the hinge edge
        stays welded to the frame. The leaf is as wide as the opening, which
        is what lets it read as a door that could actually shut.
      */}
      <group position={[1.1, 0, 0.18]} rotation={[0, -1.15, 0]}>
        {/* Hung from the hinge edge, so the leaf reaches into the room. */}
        <group position={[1.05, 0, 0]}>
          <mesh position={[0, 1.7, 0]} castShadow>
            <boxGeometry args={[2.1, 3.34, 0.1]} />
            <meshStandardMaterial color="#a97c4e" flatShading roughness={0.9} />
          </mesh>
          {[2.44, 0.98].map((y) => (
            <mesh key={y} position={[0, y, 0.065]}>
              <boxGeometry args={[1.5, 1.08, 0.03]} />
              <meshStandardMaterial
                color="#8f6741"
                flatShading
                roughness={0.9}
              />
            </mesh>
          ))}
          {/* Handle on the swinging edge, the far one from the hinge. */}
          {[0.075, -0.075].map((z) => (
            <mesh key={z} position={[-0.82, 1.62, z]}>
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshStandardMaterial
                color="#d8b25c"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
        {/* Two hinges on the line the leaf turns about. */}
        {[0.85, 2.55].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.26, 6]} />
            <meshStandardMaterial
              color="#8a6f4e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
      <pointLight
        position={[0, 1.8, 0.8]}
        intensity={6}
        distance={7}
        color="#ffca7a"
      />
    </group>
  )
}

/**
 * A flight going up through the ceiling. There is no ceiling mesh to cut a
 * hole in, so the top of it simply runs into a dark soffit and stops, which
 * is all the eye needs from a camera that never gets above the wall line.
 */
function UpFlight() {
  const { treads, rise, going } = FLIGHT

  return (
    <group>
      {Array.from({ length: treads }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0.22 + i * rise, 1.6 - i * going]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.8, rise, going + 0.06]} />
          <meshStandardMaterial color="#c3b393" flatShading roughness={0.95} />
        </mesh>
      ))}

      {/* Closed strings either side, with a rail along the top of each. */}
      {[-1.5, 1.5].map((x) => {
        const pitch = Math.atan2(FLIGHT_RISE, FLIGHT_RUN)
        const run = Math.hypot(FLIGHT_RISE, FLIGHT_RUN)
        const midZ = 1.6 - FLIGHT_RUN / 2
        return (
          <group key={x}>
            <mesh position={[x, 1.9, midZ]} rotation={[pitch, 0, 0]} castShadow>
              <boxGeometry args={[0.18, 0.6, run]} />
              <meshStandardMaterial
                color="#8f6a45"
                flatShading
                roughness={0.9}
              />
            </mesh>
            <mesh
              position={[x, 2.72, midZ]}
              rotation={[pitch, 0, 0]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.12, run]} />
              <meshStandardMaterial color="#7d5a3a" flatShading />
            </mesh>
          </group>
        )
      })}

      {/* The soffit it disappears into. */}
      <mesh position={[0, 3.9, 1.6 - FLIGHT_RUN - 0.3]}>
        <boxGeometry args={[3.1, 1.2, 1.6]} />
        <meshStandardMaterial
          color="#241e2a"
          flatShading
          roughness={1}
          side={BackSide}
        />
      </mesh>
      <pointLight
        position={[0, 3.4, 1.6 - FLIGHT_RUN]}
        intensity={7}
        distance={7}
        color="#ffe6b8"
      />
    </group>
  )
}
