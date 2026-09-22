import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ShaderMaterial, type Group } from 'three'
import { WATER_LEVEL } from '../island/terrainLogic'
import { SWIM_SPEED, type Swimmer } from './swimLogic'
import { LIE_ON_SEA_VERTEX, ON_WATER } from '../island/sea'

/**
 * Somebody's mark on the water while they are swimming: a collar of churn
 * round their shoulders, and a short trail behind them that only shows while
 * they are going anywhere. Both are one sheet pinned to the sea surface in
 * the vertex shader, the same trick the lifeboat's wake is — the shape is
 * done in the fragment so it has no edge to catch on, and it follows every
 * crest under it rather than slicing through them.
 *
 * The collar is not decoration: without it whoever is in the water is a
 * figure standing in a sheet of blue with a hard line across their chest.
 * Anybody who swims gets one, which so far means him and, once she is with
 * him, her.
 */
/** The sheet the foam is painted on: a few metres either side of them. */
const SIZE = { w: 6, l: 9 }

const FOAM_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPush;
  uniform float uFade;
  uniform vec2 uPlane;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    // Metres from him; +y is astern.
    vec2 m = (vUv - 0.5) * uPlane;
    float d = length(m);

    // The collar. It is here to hide the seam where he cuts the surface,
    // which nothing about the way he is drawn would ever hide on its own.
    float ring = smoothstep(0.26, 0.5, d) * (1.0 - smoothstep(0.5, 1.25, d));
    float churn = 0.58 + 0.42 * sin(d * 20.0 - uTime * 6.0 + m.x * 3.0);

    // And the trail, which opens out behind him and dies away quickly: a
    // swimmer leaves a few metres of disturbed water, not a ship's wake.
    float along = max(m.y, 0.0);
    float mouth = 0.3 + along * 0.22;
    float lane = 1.0 - smoothstep(0.0, 0.16, abs(abs(m.x) - mouth));
    float tail = 1.0 - smoothstep(0.0, 3.4, along);
    float kick = 0.45 + 0.55 * sin(along * 7.0 - uTime * 9.0);

    float a = ring * churn * 0.5 + lane * tail * kick * 0.4 * uPush;
    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0) * uFade);
    #include <colorspace_fragment>
  }
`

export function SwimWake({ read }: { read: () => Swimmer }) {
  const root = useRef<Group>(null)
  /** Last position, to read how hard they are swimming off their own speed. */
  const was = useRef({ x: 0, z: 0 })
  const push = useRef(0)
  const fade = useRef(0)

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSea: { value: WATER_LEVEL },
          uLift: { value: 0.07 },
          uPush: { value: 0 },
          uFade: { value: 0 },
          uPlane: { value: [SIZE.w, SIZE.l] },
          uColor: { value: new Color('#f4fdff') },
        },
        vertexShader: LIE_ON_SEA_VERTEX,
        fragmentShader: FOAM_FRAG,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const who = read()
    const want = who.afloat ? 1 : 0
    fade.current += (want - fade.current) * Math.min(1, delta * 4)

    if (root.current) {
      root.current.visible = fade.current > 0.01
      if (!root.current.visible) {
        was.current.x = who.x
        was.current.z = who.z
        return
      }
      root.current.position.set(who.x, WATER_LEVEL, who.z)
      root.current.rotation.y = who.facing
    }

    const moved =
      Math.hypot(who.x - was.current.x, who.z - was.current.z) / delta
    was.current.x = who.x
    was.current.z = who.z
    push.current +=
      (Math.min(1, moved / SWIM_SPEED) - push.current) * Math.min(1, delta * 5)

    material.uniforms.uTime.value = frame.clock.elapsedTime
    material.uniforms.uPush.value = push.current
    material.uniforms.uFade.value = fade.current
  })

  return (
    <group ref={root} visible={false}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={ON_WATER}
        material={material}
      >
        <planeGeometry args={[SIZE.w, SIZE.l, 10, 16]} />
      </mesh>
    </group>
  )
}
