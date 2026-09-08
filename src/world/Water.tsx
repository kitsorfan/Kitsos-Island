import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, PlaneGeometry, ShaderMaterial } from 'three'
import { WATER_LEVEL } from '../game/terrain'
import { useGame } from '../state/store'

/** The sea by day, and the same sea under a moon. */
const PALETTE = {
  day: {
    shallow: '#57c7d4',
    deep: '#1d6ea8',
    foam: '#f2fbff',
    horizon: '#9fd0e8',
  },
  night: {
    shallow: '#14506e',
    deep: '#07203a',
    foam: '#9fc4d8',
    horizon: '#0b1a2e',
  },
}

const SHORE_RADIUS = 123

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;

  void main() {
    vec3 p = position;
    float w =
      sin(p.x * 0.085 + uTime * 0.9) * 0.24 +
      sin(p.z * 0.11 - uTime * 1.05) * 0.19 +
      sin((p.x + p.z) * 0.042 + uTime * 0.55) * 0.16;
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
  varying vec3 vWorld;
  varying float vWave;

  void main() {
    float r = length(vWorld.xz);
    float depth = smoothstep(uShore, uShore + 46.0, r);
    vec3 col = mix(uShallow, uDeep, depth);
    col += vWave * 0.22;

    float wobble = sin(r * 0.2 - uTime * 1.5) * 1.6;
    float foam = 1.0 - smoothstep(0.0, 6.0, abs(r - uShore - wobble));
    col = mix(col, uFoam, foam * 0.7);

    float sparkle = pow(
      max(0.0, sin(vWorld.x * 1.6 + uTime * 1.2) * sin(vWorld.z * 1.9 - uTime * 0.9)),
      26.0
    );
    col += sparkle * 0.28 * (1.0 - smoothstep(90.0, 260.0, r));

    // Fade toward the sky so the ocean has no visible edge.
    float horizon = smoothstep(400.0, 1050.0, r);
    col = mix(col, uHorizon, horizon * 0.85);

    gl_FragColor = vec4(col, mix(0.8, 1.0, depth));
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
    }),
    [],
  )

  useEffect(() => {
    const colors = night ? PALETTE.night : PALETTE.day
    uniforms.uShallow.value.set(colors.shallow)
    uniforms.uDeep.value.set(colors.deep)
    uniforms.uFoam.value.set(colors.foam)
    uniforms.uHorizon.value.set(colors.horizon)
  }, [night, uniforms])

  useFrame((_, delta) => {
    if (material.current) {
      material.current.uniforms.uTime.value += delta
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
