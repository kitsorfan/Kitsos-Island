import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three'
import { WATER_LEVEL } from '../game/terrain'
import { useGame } from '../state/store'
import { SWELL_GLSL } from './sea'

/** The sea by day, and the same sea under a moon. */
const PALETTE = {
  day: {
    shallow: '#57c7d4',
    deep: '#12558c',
    foam: '#f2fbff',
    horizon: '#9fd0e8',
    /** What a flat patch of sea reflects, which is most of what it looks like. */
    sky: '#bfe4f4',
    glint: '#fffdf0',
  },
  night: {
    shallow: '#14506e',
    deep: '#061a30',
    foam: '#9fc4d8',
    horizon: '#0b1a2e',
    sky: '#20406a',
    glint: '#cfd9f5',
  },
}

/** Where the sun is, to the metre it matters: the same rig as <Daylight/>. */
const SUN = {
  day: new Vector3(120, 150, 80).normalize(),
  night: new Vector3(-120, 110, -100).normalize(),
}

const SHORE_RADIUS = 123

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;

  ${SWELL_GLSL}

  void main() {
    vec3 p = position;
    float w = swellAt(p.xz, uTime);
    p.y += w;
    vWave = w;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uShore;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uHorizon;
  uniform vec3 uSky;
  uniform vec3 uGlint;
  uniform vec3 uSun;
  uniform float uGloss;
  varying vec3 vWorld;
  varying float vWave;

  ${SWELL_GLSL}

  /**
   * The surface normal, taken as a slope of the same water the vertices were
   * moved by plus the chop they were not. Two extra samples a pixel buys the
   * whole difference between a sheet of coloured plastic and a sea.
   */
  vec3 seaNormal(vec2 p, float detail) {
    float e = 0.35;
    float h  = swellAt(p, uTime)                 + chopAt(p, uTime) * detail;
    float hx = swellAt(p + vec2(e, 0.0), uTime)  + chopAt(p + vec2(e, 0.0), uTime) * detail;
    float hz = swellAt(p + vec2(0.0, e), uTime)  + chopAt(p + vec2(0.0, e), uTime) * detail;
    return normalize(vec3(-(hx - h) / e, 1.0, -(hz - h) / e));
  }

  void main() {
    float r = length(vWorld.xz);
    vec3 toEye = cameraPosition - vWorld;
    float range = length(toEye);
    vec3 view = toEye / max(range, 0.001);

    // The chop is only drawn where it can be resolved. Kept up to the
    // horizon it would just boil, which is worse than a calm distance.
    float detail = 1.0 - smoothstep(50.0, 480.0, range);

    vec3 n = seaNormal(vWorld.xz, detail);

    float depth = smoothstep(uShore, uShore + 46.0, r);
    vec3 body = mix(uShallow, uDeep, depth);

    // Water is a mirror at a glancing angle and a window from overhead, and
    // that one term is why a sea looks wet.
    float facing = max(dot(n, view), 0.0);
    float mirror = pow(1.0 - facing, 3.5);
    vec3 col = mix(body, uSky, mirror * 0.62);

    // A little shaping off the sun so the swell has near sides and far ones.
    col *= 0.88 + max(dot(n, uSun), 0.0) * 0.3;

    // And the sun's own road across the water, which the old sparkle was a
    // stand-in for: a broad soft sheen with a tighter glitter laid over it.
    // Both lobes are wide, because the chop only tilts the surface by ten
    // degrees or so and a mirror-tight highlight would simply never appear.
    vec3 mid = normalize(uSun + view);
    float lobe = max(dot(n, mid), 0.0);
    float road = pow(lobe, 14.0) * 0.22 + pow(lobe, 90.0) * 0.55;
    col += uGlint * road * uGloss * (0.35 + detail * 0.65);

    // Foam where it breaks on the sand, thickest on the crests.
    float wobble = sin(r * 0.2 - uTime * 1.5) * 1.6;
    float surf = 1.0 - smoothstep(0.0, 6.0, abs(r - uShore - wobble));
    col = mix(col, uFoam, surf * (0.55 + max(vWave, 0.0) * 0.9));

    // Fade toward the sky so the ocean has no visible edge.
    float horizon = smoothstep(400.0, 1050.0, r);
    col = mix(col, uHorizon, horizon * 0.85);

    gl_FragColor = vec4(col, mix(0.82, 1.0, depth));
    #include <colorspace_fragment>
  }
`

export function Water() {
  const material = useRef<ShaderMaterial>(null)
  const night = useGame((s) => s.night)

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(2400, 2400, 240, 240)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShore: { value: SHORE_RADIUS },
      uShallow: { value: new Color(PALETTE.day.shallow) },
      uDeep: { value: new Color(PALETTE.day.deep) },
      uFoam: { value: new Color(PALETTE.day.foam) },
      uHorizon: { value: new Color(PALETTE.day.horizon) },
      uSky: { value: new Color(PALETTE.day.sky) },
      uGlint: { value: new Color(PALETTE.day.glint) },
      uSun: { value: SUN.day.clone() },
      uGloss: { value: 1 },
    }),
    [],
  )

  useEffect(() => {
    const colors = night ? PALETTE.night : PALETTE.day
    uniforms.uShallow.value.set(colors.shallow)
    uniforms.uDeep.value.set(colors.deep)
    uniforms.uFoam.value.set(colors.foam)
    uniforms.uHorizon.value.set(colors.horizon)
    uniforms.uSky.value.set(colors.sky)
    uniforms.uGlint.value.set(colors.glint)
    uniforms.uSun.value.copy(night ? SUN.night : SUN.day)
    // A moon lays a road on the water too, but a far dimmer one.
    uniforms.uGloss.value = night ? 0.4 : 1
  }, [night, uniforms])

  // Off the scene clock rather than an accumulator of its own, because the
  // hull of the lifeboat samples the same swell from the same clock and the
  // two have to agree to the centimetre.
  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh geometry={geometry} position={[0, WATER_LEVEL, 0]} renderOrder={1}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  )
}
