import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, DoubleSide, ShaderMaterial } from 'three'
import type {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three'
import { PLAYER_COLORS } from '../data/world'
import {
  ALONGSIDE,
  AT_ONCE,
  BEACH,
  LAST_GASP,
  RESCUE,
  SLOW,
  stepRescue,
} from '../game/rescue'
import { readMove } from '../game/input'
import { WATER_LEVEL } from '../game/terrain'
import { isInteractive, useGame } from '../state/store'
import { Character, type CharacterMotion } from './Character'
import { PLAYER_POS, PLAYER_VIEW } from '../game/player'
import { LIE_ON_SEA_VERTEX, ON_WATER, waveAt } from './sea'
import { buildHull, HULL_SIZE } from './lifeboatHull'
import * as sfx from '../game/audio'

/* ------------------------------ sea dressing ------------------------------ */

/**
 * Everything the boat writes on the water — her wake, the moustache at the
 * bow, the collar round the hull — is one of these: a flat sheet pinned to
 * the sea surface in the vertex shader, with the shape of the foam done in
 * the fragment shader so it has no edge to catch on.
 *
 * A hard-edged white rectangle towed astern is what the wake used to be, and
 * it was the single worst thing in the game to look at.
 */
function foamMaterial(
  fragmentShader: string,
  extra: Record<string, { value: unknown }> = {},
) {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSea: { value: WATER_LEVEL },
      uLift: { value: 0.07 },
      uPush: { value: 0 },
      uColor: { value: new Color('#f4fdff') },
      ...extra,
    },
    vertexShader: LIE_ON_SEA_VERTEX,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })
}

const WAKE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPush;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    float along = vUv.y;
    float across = abs(vUv.x - 0.5) * 2.0;

    // The wake opens out astern, and thins as it opens.
    float mouth = 0.2 + along * 0.8;
    float inside = 1.0 - smoothstep(mouth - 0.34, mouth, across);
    float tail = pow(1.0 - along, 1.4);

    // The two divergent crests running out from her quarters, which are the
    // part of a wake the eye actually reads as speed.
    float lane = 1.0 - smoothstep(0.0, 0.15, abs(across - mouth * 0.88));

    // And the propeller wash, which is only ever close in.
    float churn = 0.5 + 0.5 * sin(along * 44.0 - uTime * 11.0 + across * 9.0);
    float wash = (1.0 - smoothstep(0.0, 0.32, along)) * churn;

    float a =
      inside * tail * (0.3 + churn * 0.24) +
      lane * tail * 0.55 +
      wash * 0.4;

    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0) * uPush);
    #include <colorspace_fragment>
  }
`

const BOW_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPush;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    float along = vUv.y;
    float across = abs(vUv.x - 0.5) * 2.0;

    // Two crests thrown off the stem and swept aft: a bow moustache.
    float v = abs(across - 0.12 - along * 0.72);
    float band = 1.0 - smoothstep(0.0, 0.2, v);
    float crest = pow(1.0 - along, 1.1);
    float ripple = 0.62 + 0.38 * sin(along * 28.0 - uTime * 9.0);

    gl_FragColor = vec4(uColor, band * crest * ripple * uPush);
    #include <colorspace_fragment>
  }
`

const COLLAR_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPush;
  uniform vec3 uColor;
  uniform vec2 uHalf;
  uniform vec2 uPlane;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    // Metres from the middle of the hull; +y is astern.
    vec2 m = (vUv - 0.5) * uPlane;
    float d = length(m / uHalf);

    // A band of disturbed water hugging her waterline. It is here to hide
    // the seam where the hull cuts the sea, which no amount of hull shape
    // would ever hide on its own.
    float band = smoothstep(0.84, 1.0, d) * (1.0 - smoothstep(1.0, 1.55, d));
    float fwd = 1.0 - smoothstep(-0.9, 0.5, m.y / uHalf.y);
    float churn = 0.6 + 0.4 * sin(d * 26.0 - uTime * 7.0 + m.x * 2.0);

    float a = band * churn * (0.3 + fwd * 0.45) * (0.45 + uPush * 0.55);
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`

/* ------------------------------- the rafts -------------------------------- */

/**
 * The gauge on the water round a raft: a ring that empties as the flare
 * burns down, and fills green while someone is actually coming over the
 * rail. It is the whole clock of the game, so it is drawn where the game is
 * rather than in the corner of the screen.
 */
const GAUGE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uBurn;
  uniform float uHaul;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    // A ring's uvs are planar and divided by the outer radius, so this
    // recovers the position in the ring's own plane.
    vec2 q = vUv * 2.0 - 1.0;
    float rr = length(q);
    float band =
      smoothstep(0.66, 0.73, rr) * (1.0 - smoothstep(0.95, 1.0, rr));
    if (band <= 0.002) discard;

    // Round the ring, nought to one.
    float sweep = fract(atan(q.x, q.y) / 6.2831853 + 1.0);

    vec3 col = mix(vec3(1.0, 0.2, 0.16), vec3(1.0, 0.79, 0.26), uBurn);
    float left = step(sweep, uBurn);
    float beat = 0.55 + 0.45 * sin(uTime * (uBurn < 0.25 ? 9.0 : 2.0));
    float a = band * (0.16 + left * (0.46 + beat * 0.34));

    if (uHaul > 0.002) {
      float done = step(sweep, uHaul);
      col = mix(col, vec3(0.5, 1.0, 0.62), done);
      a = band * (0.24 + done * 0.66);
    }

    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

/** The smoke off a hand flare, which is what you actually navigate by. */
const SMOKE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // It leans and curls as it goes up, and more of both the higher it gets.
    float h = uv.y * uv.y;
    p.x += sin(uTime * 0.7 + uSeed + uv.y * 3.0) * h * 2.4;
    p.z += cos(uTime * 0.55 + uSeed + uv.y * 2.4) * h * 1.8;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const SMOKE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uBurn;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    float h = vUv.y;

    // Orange at the base and grey by the top, and the whole column goes to
    // a deep red as the flare burns down, which is a warning you can read
    // from the far side of the sea, as a number on the glass is not.
    vec3 hot = mix(vec3(0.92, 0.16, 0.12), vec3(0.98, 0.48, 0.14), uBurn);
    vec3 col = mix(hot, vec3(0.44, 0.46, 0.5), smoothstep(0.04, 0.55, h));

    float puff =
      0.55 + 0.45 * sin(h * 20.0 - uTime * 2.4 + uSeed + vUv.x * 11.0);
    float a = (1.0 - smoothstep(0.2, 1.0, h)) * puff * 0.55;

    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

const SMOKE_HEIGHT = 15

/**
 * The rafts, drawn from a fixed pool: they come and go outside React, so each
 * frame hides the spare ones rather than re-rendering the group.
 */
function Rafts() {
  const groups = useRef<(Group | null)[]>([])
  const rafts = useRef<(Group | null)[]>([])
  const arms = useRef<(Group | null)[]>([])

  const gauges = useMemo(
    () =>
      Array.from(
        { length: AT_ONCE },
        () =>
          new ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uSea: { value: WATER_LEVEL },
              uLift: { value: 0.05 },
              uBurn: { value: 1 },
              uHaul: { value: 0 },
            },
            vertexShader: LIE_ON_SEA_VERTEX,
            fragmentShader: GAUGE_FRAG,
            transparent: true,
            depthWrite: false,
          }),
      ),
    [],
  )
  const smokes = useMemo(
    () =>
      Array.from(
        { length: AT_ONCE },
        (_, i) =>
          new ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uBurn: { value: 1 },
              uSeed: { value: i * 3.1 },
            },
            vertexShader: SMOKE_VERT,
            fragmentShader: SMOKE_FRAG,
            transparent: true,
            depthWrite: false,
            side: DoubleSide,
          }),
      ),
    [],
  )
  useEffect(
    () => () => {
      gauges.forEach((m) => m.dispose())
      smokes.forEach((m) => m.dispose())
    },
    [gauges, smokes],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < AT_ONCE; i++) {
      const group = groups.current[i]
      if (!group) continue
      const soul = RESCUE.people[i]
      group.visible = Boolean(soul) && RESCUE.active
      if (!soul) continue

      group.position.set(soul.x, WATER_LEVEL, soul.z)

      const burn = Math.max(0, soul.burn / soul.life)
      gauges[i].uniforms.uTime.value = t
      gauges[i].uniforms.uBurn.value = burn
      gauges[i].uniforms.uHaul.value = soul.aboard
      smokes[i].uniforms.uTime.value = t
      smokes[i].uniforms.uBurn.value = burn

      // The raft rides the swell; only the gauge on the water takes its own
      // height off the sea in the shader.
      const raft = rafts.current[i]
      if (raft) {
        raft.position.y = waveAt(soul.x, soul.z, t)
        raft.rotation.z = Math.sin(t * 1.2 + soul.id) * 0.1
        raft.rotation.x = Math.cos(t * 0.95 + soul.id * 1.7) * 0.09
        raft.rotation.y = t * 0.12 + soul.id
      }
      // And the arm holding the flare up waves until someone is alongside.
      const arm = arms.current[i]
      if (arm) {
        arm.rotation.z = soul.hauling
          ? -0.5
          : -0.9 + Math.sin(t * 5 + soul.id) * 0.45
      }
    }
  })

  return (
    <group>
      {Array.from({ length: AT_ONCE }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el
          }}
          visible={false}
        >
          {/* The clock, lying on the water round them. */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={ON_WATER}
            material={gauges[i]}
          >
            <ringGeometry args={[2.2, 3.2, 64, 1]} />
          </mesh>

          <group
            ref={(el) => {
              rafts.current[i] = el
            }}
          >
            {/* An inflatable, and someone in it with a flare held up. */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[1.15, 0.36, 6, 14]} />
              <meshStandardMaterial
                color="#e8801f"
                flatShading
                roughness={0.8}
              />
            </mesh>
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.94, 14]} />
              <meshStandardMaterial
                color="#2b2f38"
                flatShading
                roughness={0.9}
              />
            </mesh>
            <mesh position={[0, 0.62, -0.1]} castShadow>
              <capsuleGeometry args={[0.3, 0.5, 4, 8]} />
              <meshStandardMaterial
                color="#f2582f"
                flatShading
                roughness={0.7}
              />
            </mesh>
            <mesh position={[0, 1.14, -0.1]}>
              <sphereGeometry args={[0.22, 10, 8]} />
              <meshStandardMaterial
                color="#e8c39a"
                flatShading
                roughness={0.8}
              />
            </mesh>

            {/* The flare itself, on the end of a raised arm. */}
            <group
              ref={(el) => {
                arms.current[i] = el
              }}
              position={[0.24, 0.92, -0.1]}
            >
              <mesh position={[0.34, 0.3, 0]} rotation={[0, 0, -0.7]}>
                <capsuleGeometry args={[0.09, 0.5, 3, 6]} />
                <meshStandardMaterial
                  color="#f2582f"
                  flatShading
                  roughness={0.7}
                />
              </mesh>
              <mesh position={[0.66, 0.62, 0]}>
                <sphereGeometry args={[0.22, 10, 8]} />
                <meshStandardMaterial
                  color="#fff3d0"
                  emissive="#ff7a1f"
                  emissiveIntensity={3.2}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>

          {/* And the smoke off it, which is how you find them at all. */}
          <mesh
            position={[0, SMOKE_HEIGHT / 2 + 1.4, 0]}
            renderOrder={ON_WATER + 4}
            material={smokes[i]}
          >
            <cylinderGeometry args={[2.6, 0.42, SMOKE_HEIGHT, 10, 8, true]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------- the shore -------------------------------- */

const SHORE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uUrgent;
  uniform float uShore;
  uniform float uWidth;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    // Off the world radius rather than the uv: a ring's uvs are planar, not
    // one axis across the band, which is a trap this walked into once.
    float band = max(1.0 - abs(length(vWorld.xz) - uShore) / uWidth, 0.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 7.0);
    vec3 col = mix(vec3(0.95, 0.98, 1.0), vec3(1.0, 0.3, 0.3), uUrgent);
    float a = band * mix(0.24, 0.34 + pulse * 0.4, uUrgent);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

/** How far the marked line spreads either side of the beach radius. */
const SHORE_BAND = 1.6
/** Metres off the sand at which the line starts warning her off it. */
const SHOAL = 22

/** Where the water runs out, drawn so it is a line and not a guess. */
function ShoreLine() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSea: { value: WATER_LEVEL },
          uLift: { value: 0.06 },
          uUrgent: { value: 0 },
          uShore: { value: BEACH },
          uWidth: { value: SHORE_BAND },
        },
        vertexShader: LIE_ON_SEA_VERTEX,
        fragmentShader: SHORE_FRAG,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    // It warns about the boat rather than about anything in the water: it
    // is the edge of her sea, and at speed it comes up very fast.
    const off = Math.hypot(RESCUE.x, RESCUE.z) - BEACH
    material.uniforms.uUrgent.value = off < SHOAL ? 1 : 0
  })

  return (
    <mesh
      position={[0, WATER_LEVEL, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={ON_WATER}
      material={material}
    >
      <ringGeometry args={[BEACH - SHORE_BAND, BEACH + SHORE_BAND, 192, 1]} />
    </mesh>
  )
}

/* -------------------------------- the boat -------------------------------- */

const PAINT = {
  topside: '#e9e4d7',
  boot: '#1d3f63',
  bottom: '#7c3b33',
  deck: '#9b8e77',
  house: '#2f6fa8',
  glass: '#1b2b36',
  steel: '#2b2f38',
  gear: '#e8801f',
}

/** How many of the ones she picks up sit visibly on the after deck. */
const SEATS = 6
/** Two rows of three under the shelter. */
const SEAT_AT = (i: number): [number, number] => [
  (i % 3) * 0.72 - 0.72,
  i < 3 ? -2.4 : -3.34,
]
/** Where the shelter posts stand. */
const POSTS: [number, number][] = [
  [-1.02, -2.1],
  [1.02, -2.1],
  [-1.02, -3.6],
  [1.02, -3.6],
]

function Lifeboat({
  skipper,
  net,
  seats,
}: {
  skipper: React.RefObject<CharacterMotion>
  net: React.RefObject<Group | null>
  seats: React.RefObject<(Group | null)[]>
}) {
  const hull = useMemo(() => buildHull(), [])
  useEffect(
    () => () => Object.values(hull).forEach((geo) => geo.dispose()),
    [hull],
  )

  return (
    <group>
      {/* The hull, lofted from stations: keel, chine, boot top, sheer. */}
      <mesh geometry={hull.bottom}>
        <meshStandardMaterial
          color={PAINT.bottom}
          flatShading
          roughness={0.9}
        />
      </mesh>
      <mesh geometry={hull.boot}>
        <meshStandardMaterial color={PAINT.boot} flatShading roughness={0.75} />
      </mesh>
      <mesh geometry={hull.topside} castShadow>
        <meshStandardMaterial
          color={PAINT.topside}
          flatShading
          roughness={0.7}
        />
      </mesh>
      <mesh geometry={hull.deck}>
        <meshStandardMaterial color={PAINT.deck} flatShading roughness={0.95} />
      </mesh>
      <mesh geometry={hull.rail} castShadow>
        <meshStandardMaterial
          color={PAINT.topside}
          flatShading
          roughness={0.7}
        />
      </mesh>
      {/* Stem bar, which also closes the knife edge at the bow. */}
      <mesh position={[0, 0.5, 5.02]}>
        <boxGeometry args={[0.14, 1.3, 0.16]} />
        <meshStandardMaterial color={PAINT.steel} flatShading />
      </mesh>

      {/* Wheelhouse, with a window band round it and a roof over the top. */}
      <mesh position={[0, 1.3, -1.4]} castShadow>
        <boxGeometry args={[1.9, 1.32, 2]} />
        <meshStandardMaterial color={PAINT.house} flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.62, -1.4]}>
        <boxGeometry args={[1.94, 0.46, 2.04]} />
        <meshStandardMaterial
          color={PAINT.glass}
          flatShading
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 2.02, -1.4]} castShadow>
        <boxGeometry args={[2.14, 0.12, 2.28]} />
        <meshStandardMaterial color="#f4f1e8" flatShading roughness={0.7} />
      </mesh>
      {/* Searchlight on the front of the roof, pointing where she is going. */}
      <mesh position={[0, 2.24, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 10]} />
        <meshStandardMaterial color={PAINT.steel} flatShading />
      </mesh>
      <mesh position={[0, 2.24, -0.36]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 10]} />
        <meshStandardMaterial
          color="#fff6de"
          emissive="#ffe6a8"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>

      {/* Mast, radar bar and the working light on top of her. */}
      <mesh position={[0, 2.96, -1.9]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 6]} />
        <meshStandardMaterial color={PAINT.steel} flatShading />
      </mesh>
      <mesh position={[0, 3.72, -1.9]}>
        <boxGeometry args={[1.3, 0.09, 0.2]} />
        <meshStandardMaterial color="#d8d2c2" flatShading />
      </mesh>
      <mesh position={[0, 3.98, -1.9]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial
          color="#ffd76b"
          emissive="#ffb03a"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      {/* Exhaust, off to one side of the house the way they always are. */}
      <mesh position={[0.62, 2.5, -2.2]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 1, 6]} />
        <meshStandardMaterial color={PAINT.steel} flatShading />
      </mesh>

      {/* The recovery side: a boarding platform just clear of the water with
          a scramble net down to it, on the starboard bow where the camera
          can see it. Everything the game is about happens on that net. */}
      <mesh position={[1.94, 0.14, 0.9]} castShadow>
        <boxGeometry args={[1.05, 0.12, 2.3]} />
        <meshStandardMaterial color={PAINT.deck} flatShading roughness={0.95} />
      </mesh>
      <group ref={net}>
        <mesh position={[1.72, 0.42, 0.9]}>
          <boxGeometry args={[0.08, 1.3, 2.1]} />
          <meshStandardMaterial color="#3a3f4a" flatShading roughness={0.95} />
        </mesh>
      </group>
      {/* The davit over it, and a lifebuoy on the rail to port. */}
      <mesh position={[1.24, 1.42, 0.9]} castShadow>
        <boxGeometry args={[0.14, 1.5, 0.14]} />
        <meshStandardMaterial color={PAINT.gear} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[1.66, 2.12, 0.9]} castShadow>
        <boxGeometry args={[1, 0.14, 0.14]} />
        <meshStandardMaterial color={PAINT.gear} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[-1.45, 1.02, 1.1]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.34, 0.09, 6, 12]} />
        <meshStandardMaterial color="#f2582f" flatShading roughness={0.8} />
      </mesh>

      {/* A shelter over the after deck for the ones she gets out, and the
          ones she gets out sitting under it: the score is a thing on the
          boat rather than a number on the glass. */}
      {POSTS.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 1.24, z]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color={PAINT.steel} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 1.88, -2.85]} castShadow>
        <boxGeometry args={[2.3, 0.1, 1.9]} />
        <meshStandardMaterial color="#c9522f" flatShading roughness={0.8} />
      </mesh>
      {Array.from({ length: SEATS }, (_, i) => {
        const [x, z] = SEAT_AT(i)
        return (
          <group
            key={i}
            ref={(el) => {
              seats.current[i] = el
            }}
            position={[x, 0.82, z]}
            visible={false}
          >
            <mesh castShadow>
              <capsuleGeometry args={[0.19, 0.34, 3, 7]} />
              <meshStandardMaterial
                color="#f2a13f"
                flatShading
                roughness={0.85}
              />
            </mesh>
            <mesh position={[0, 0.34, 0]}>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshStandardMaterial
                color="#e8c39a"
                flatShading
                roughness={0.85}
              />
            </mesh>
          </group>
        )
      })}

      {/* The skipper, at the wheel where he belongs. */}
      <group position={[0, 0.66, -0.5]} scale={0.92}>
        <Character colors={PLAYER_COLORS} motion={skipper} />
      </group>
    </group>
  )
}

/* --------------------------------- the run -------------------------------- */

const CAM = { distance: 30, height: 14 }

/** The sheets she writes on the water, and the plane each one is drawn on. */
const WAKE_PLANE = { w: 9, l: 30 }
const BOW_PLANE = { w: 7, l: 7 }
const COLLAR_PLANE = { w: HULL_SIZE.beam * 3, l: HULL_SIZE.loa * 1.7 }

/**
 * Drives the run: reads the helm, steps the sea, and owns the camera while
 * the boat is out. Mounted in place of <Player/>, so the two never fight over
 * where the camera is looking.
 */
export function BoatGame() {
  const camera = useThree((s) => s.camera)
  const body = useRef<Group>(null)
  const foam = useRef<Group>(null)
  const net = useRef<Group>(null)
  const pointer = useRef<Group>(null)
  const reach = useRef<Mesh>(null)
  const seats = useRef<(Group | null)[]>([])
  const skipper = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const camYaw = useRef(RESCUE.heading)
  const camReady = useRef(false)

  const sheets = useMemo(
    () => ({
      wake: foamMaterial(WAKE_FRAG),
      bow: foamMaterial(BOW_FRAG),
      collar: foamMaterial(COLLAR_FRAG, {
        uHalf: { value: [HULL_SIZE.beam * 0.52, HULL_SIZE.loa * 0.52] },
        uPlane: { value: [COLLAR_PLANE.w, COLLAR_PLANE.l] },
      }),
    }),
    [],
  )
  useEffect(
    () => () => Object.values(sheets).forEach((m) => m.dispose()),
    [sheets],
  )

  useEffect(() => {
    if (body.current) body.current.rotation.order = 'YXZ'
    camReady.current = false
  }, [])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const t = state.clock.elapsedTime
    const store = useGame.getState()
    const run = store.rescue
    const live =
      run?.status === 'sailing' && RESCUE.active && isInteractive(store.mode)

    const move = live ? readMove() : { x: 0, y: 0, run: false }

    if (live) {
      const events = stepRescue(delta, { throttle: move.y, steer: move.x })
      if (events.aground) sfx.thud()
      if (events.lit) sfx.blip()
      if (events.guttering) sfx.hurt()
      for (let i = 0; i < events.saved; i++) sfx.coin()
      if (events.over) store.finishRescue()
    }

    /* ---------------------------- her attitude ---------------------------- */

    // She takes her heave, pitch and roll off the water itself rather than
    // off a sine of her own: four soundings round the hull, and the plane
    // through them is the plane she sits in. With draft under her now, the
    // crests break against the hull instead of coming up through the deck.
    const fx = Math.sin(RESCUE.heading)
    const fz = Math.cos(RESCUE.heading)
    const reachZ = HULL_SIZE.loa * 0.4
    const reachX = HULL_SIZE.beam * 0.5
    const lift = waveAt(RESCUE.x, RESCUE.z, t)
    const bow = waveAt(RESCUE.x + fx * reachZ, RESCUE.z + fz * reachZ, t)
    const stern = waveAt(RESCUE.x - fx * reachZ, RESCUE.z - fz * reachZ, t)
    const stbd = waveAt(RESCUE.x + fz * reachX, RESCUE.z - fx * reachX, t)
    const port = waveAt(RESCUE.x - fz * reachX, RESCUE.z + fx * reachX, t)
    const pitch = Math.atan2(bow - stern, reachZ * 2)
    const roll = Math.atan2(stbd - port, reachX * 2)

    if (body.current) {
      // She squats a little at speed, and settles back as the way comes off.
      body.current.position.set(
        RESCUE.x,
        WATER_LEVEL + lift - RESCUE.way * 0.004,
        RESCUE.z,
      )
      body.current.rotation.y = RESCUE.heading
      body.current.rotation.z = RESCUE.heel + roll
      body.current.rotation.x = -RESCUE.trim - pitch
    }

    skipper.current.moving = RESCUE.way > 1
    skipper.current.speed = RESCUE.way * 0.1

    // The net swings further down over the side while someone is on it.
    if (net.current) {
      const target = RESCUE.hauling ? 0.95 : 0.6
      net.current.rotation.z += (target - net.current.rotation.z) * 0.12
    }

    // And they sit under the shelter afterwards, which is the score.
    for (let i = 0; i < SEATS; i++) {
      const seat = seats.current[i]
      if (!seat) continue
      seat.visible = i < RESCUE.saved
      if (seat.visible) seat.rotation.z = Math.sin(t * 1.4 + i) * 0.05
    }

    /* ------------------------ what she writes on it ----------------------- */

    // The sheets follow her position and her heading only: they take their
    // own height off the sea in the shader, so a hull that is pitching must
    // not be allowed to tip them off it.
    if (foam.current) {
      foam.current.position.set(RESCUE.x, WATER_LEVEL, RESCUE.z)
      foam.current.rotation.y = RESCUE.heading
    }
    const push = Math.min(1, RESCUE.way / 16)
    sheets.wake.uniforms.uTime.value = t
    sheets.wake.uniforms.uPush.value = push
    sheets.bow.uniforms.uTime.value = t
    sheets.bow.uniforms.uPush.value = push * 0.9
    sheets.collar.uniforms.uTime.value = t
    sheets.collar.uniforms.uPush.value = push

    // A ring on the water at the range they can reach her from, shown only
    // once she is near one: it answers "am I close enough, and am I slow
    // enough", which are the only two questions the game ever asks.
    if (reach.current) {
      const near = live && RESCUE.alongside !== null
      reach.current.visible = near
      if (near) {
        reach.current.position.set(
          RESCUE.x,
          WATER_LEVEL + lift + 0.09,
          RESCUE.z,
        )
        const slow = RESCUE.way < SLOW
        const ring = reach.current.material as MeshBasicMaterial
        ring.color.set(slow ? '#7dffa4' : '#ffd76b')
        ring.opacity = slow ? 0.5 : 0.24 + Math.sin(t * 8) * 0.12
      }
    }

    // An arrow over the wheelhouse, pointing at whichever flare has the
    // least left in it. The order is the game, so the game says the order.
    if (pointer.current) {
      const worry = live ? RESCUE.worry : null
      pointer.current.visible = Boolean(worry)
      if (worry) {
        pointer.current.position.set(
          RESCUE.x,
          WATER_LEVEL + lift + 5.4 + Math.sin(t * 3) * 0.18,
          RESCUE.z,
        )
        pointer.current.rotation.y = Math.atan2(
          worry.x - RESCUE.x,
          worry.z - RESCUE.z,
        )
        const head = (pointer.current.children[0] as Mesh)
          .material as MeshStandardMaterial
        head.color.set(worry.burn < LAST_GASP ? '#ff4d4d' : '#ff8a3d')
      }
    }

    PLAYER_POS.set(RESCUE.x, WATER_LEVEL, RESCUE.z)
    PLAYER_VIEW.facing = RESCUE.heading

    /* ------------------------------- camera ------------------------------- */

    let swing = RESCUE.heading - camYaw.current
    while (swing > Math.PI) swing -= Math.PI * 2
    while (swing < -Math.PI) swing += Math.PI * 2
    camYaw.current += swing * Math.min(1, delta * 2.6)

    // She pulls away from the camera as she picks up, which is a good part of
    // what makes speed feel like speed.
    const range = CAM.distance + RESCUE.way * 0.28
    const targetX = RESCUE.x - Math.sin(camYaw.current) * range
    const targetY = WATER_LEVEL + CAM.height
    const targetZ = RESCUE.z - Math.cos(camYaw.current) * range

    if (!camReady.current) {
      camera.position.set(targetX, targetY, targetZ)
      camReady.current = true
    }
    const ease = 1 - Math.pow(0.004, delta)
    camera.position.x += (targetX - camera.position.x) * ease
    camera.position.y += (targetY - camera.position.y) * ease
    camera.position.z += (targetZ - camera.position.z) * ease
    camera.lookAt(RESCUE.x, WATER_LEVEL + 2, RESCUE.z)
  })

  return (
    <group>
      <ShoreLine />
      <Rafts />

      <group ref={body}>
        <Lifeboat skipper={skipper} net={net} seats={seats} />
      </group>

      {/* Her mark on the water: wake, bow moustache, collar. */}
      <group ref={foam}>
        <mesh
          position={[0, 0, HULL_SIZE.stern - WAKE_PLANE.l / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={ON_WATER}
          material={sheets.wake}
        >
          <planeGeometry args={[WAKE_PLANE.w, WAKE_PLANE.l, 10, 30]} />
        </mesh>
        <mesh
          position={[0, 0, HULL_SIZE.bow - BOW_PLANE.l / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={ON_WATER}
          material={sheets.bow}
        >
          <planeGeometry args={[BOW_PLANE.w, BOW_PLANE.l, 10, 10]} />
        </mesh>
        <mesh
          position={[0, 0, (HULL_SIZE.bow + HULL_SIZE.stern) / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={ON_WATER}
          material={sheets.collar}
        >
          <planeGeometry args={[COLLAR_PLANE.w, COLLAR_PLANE.l, 14, 18]} />
        </mesh>
      </group>

      {/* The range at which they can reach her, drawn round her while she is
          near a raft. Green once the way is off her enough to be boarded. */}
      <mesh
        ref={reach}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={ON_WATER + 1}
        visible={false}
      >
        <ringGeometry args={[ALONGSIDE - 0.5, ALONGSIDE, 64]} />
        <meshBasicMaterial
          color="#7dffa4"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Anything standing above the sea has to write depth. The water is
          transparent and drawn after the opaque pass, so a mesh that skips
          the depth buffer is simply painted over by it. */}
      <group ref={pointer} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.1, 3.4, 4]} />
          <meshStandardMaterial color="#ff8a3d" flatShading roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -1.1]}>
          <boxGeometry args={[0.9, 0.9, 2]} />
          <meshStandardMaterial color="#c9520f" flatShading roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
