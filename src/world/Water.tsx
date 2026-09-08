import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, PlaneGeometry, ShaderMaterial } from 'three'
import { WATER_LEVEL } from '../game/terrain'

const SHORE_RADIUS = 41

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;

  void main() {
    vec3 p = position;
    float w =
      sin(p.x * 0.24 + uTime * 0.9) * 0.18 +
      sin(p.z * 0.31 - uTime * 1.05) * 0.14 +
      sin((p.x + p.z) * 0.12 + uTime * 0.55) * 0.12;
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
    float depth = smoothstep(uShore, uShore + 16.0, r);
    vec3 col = mix(uShallow, uDeep, depth);
    col += vWave * 0.22;

    float wobble = sin(r * 0.55 - uTime * 1.5) * 0.7;
    float foam = 1.0 - smoothstep(0.0, 2.4, abs(r - uShore - wobble));
    col = mix(col, uFoam, foam * 0.7);

    float sparkle = pow(
      max(0.0, sin(vWorld.x * 1.6 + uTime * 1.2) * sin(vWorld.z * 1.9 - uTime * 0.9)),
      26.0
    );
    col += sparkle * 0.28 * (1.0 - smoothstep(28.0, 120.0, r));

    // Fade toward the sky so the ocean has no visible edge.
    float horizon = smoothstep(160.0, 430.0, r);
    col = mix(col, uHorizon, horizon * 0.85);

    gl_FragColor = vec4(col, mix(0.8, 1.0, depth));
    #include <colorspace_fragment>
  }
`

export function Water() {
  const material = useRef<ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(920, 920, 184, 184)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShore: { value: SHORE_RADIUS },
      uShallow: { value: new Color('#57c7d4') },
      uDeep: { value: new Color('#1d6ea8') },
      uFoam: { value: new Color('#f2fbff') },
      uHorizon: { value: new Color('#9fd0e8') },
    }),
    [],
  )

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
