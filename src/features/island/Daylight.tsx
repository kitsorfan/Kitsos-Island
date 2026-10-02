import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import { Color } from 'three'
import type { Group } from 'three'
import { useGame } from '../../shared/state/store'
import { hazeColor, weatherHaze } from '../live/haze'
import { gloom, overcast } from '../live/weatherLogic'
import type { Conditions } from '../live/weatherLogic'

/**
 * The island's two skies and the light that comes with each.
 *
 * The switch is deliberately instant — a lights-out moment rather than a
 * sunset — so nothing has to cross-fade two sky shaders at once.
 *
 * The weather leans on both. Live's forecast greys the sky, takes the sun
 * down under a lid of cloud and thickens the air; with Live off it is the
 * island's own fair weather, and both skies are exactly as they always were.
 */
export function Daylight({
  night,
  weather,
}: {
  night: boolean
  weather: Conditions
}) {
  return night ? <Night weather={weather} /> : <Day weather={weather} />
}

/** How far the night is turned down while hide and seek is being played. */
const DARK = 0.34

/** The sky light on a fair day, and on a grey one. */
const BLUE = new Color('#cfe9ff')
const GREY = new Color('#c9cfd6')

function Day({ weather }: { weather: Conditions }) {
  const grey = overcast(weather)
  const dark = gloom(weather)
  /**
   * How much of the sun gets through. Very little under a sky that is all
   * cloud — which is what takes the shadows away, and a grey day has none
   * to speak of.
   */
  const sun = (1 - grey * 0.85) * (1 - dark * 0.3)
  const sky = useMemo(() => BLUE.clone().lerp(GREY, grey), [grey])
  const haze = useMemo(() => hazeColor(weather, false), [weather])

  return (
    <>
      <Sky
        distance={9000}
        sunPosition={[160, 90, 80]}
        inclination={0.52}
        azimuth={0.28}
        turbidity={5 + grey * 9}
        rayleigh={1.4 * (1 - grey * 0.6)}
        mieCoefficient={0.006}
        mieDirectionalG={0.82}
      />
      {/* No haze on a fair day, which is how the island has always looked.
          Fog is the air itself; rain and snow bring a little of their own. */}
      {weather.fog > 0.02 && (
        <fogExp2 attach="fog" args={[haze, 0.0012 + weatherHaze(weather)]} />
      )}

      {/* Cloud scatters the light it takes from the sun, so most of what
          the sun loses the sky gives back from everywhere at once: a grey
          day is flat rather than dark. Rain and a storm take some of it. */}
      <hemisphereLight
        color={sky}
        groundColor="#6d8f4c"
        intensity={1.05 + grey * 0.3 - dark * 0.4}
      />
      <ambientLight intensity={0.25 + grey * 0.2 - dark * 0.1} />
      <directionalLight
        position={[120, 150, 80]}
        intensity={2.1 * sun}
        color="#fff4dd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0009}
        shadow-normalBias={0.05}
        shadow-camera-near={1}
        shadow-camera-far={420}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      {/* Cool bounce from the sea, opposite the sun. */}
      <directionalLight
        position={[-110, 60, -80]}
        intensity={0.35 * (0.6 + 0.4 * sun)}
        color="#9fd8ff"
      />
    </>
  )
}

function Night({ weather }: { weather: Conditions }) {
  const moon = useRef<Group>(null)
  // Lights out means lights out: the moon and the sky bounce come most of
  // the way down too, or there is no point carrying a torch.
  const hidden = useGame((s) => (s.hide === null ? 1 : DARK))
  const grey = overcast(weather)
  /** Cloud takes the moon's share down too, though not all of it. */
  const dim = hidden * (1 - grey * 0.45)

  useFrame((state) => {
    // The moon drifts, very slowly, so a long night is not a still image.
    if (moon.current) {
      moon.current.rotation.y = state.clock.elapsedTime * 0.004
    }
  })

  return (
    <>
      {/* The sun is pushed below the horizon, which leaves the deep blue the
          sky shader gives at dusk rather than a flat black backdrop. */}
      <Sky
        distance={9000}
        sunPosition={[-120, -34, -90]}
        turbidity={0.9}
        rayleigh={0.42}
        mieCoefficient={0.004}
        mieDirectionalG={0.9}
      />
      {/* Most of a cloudy night has no stars in it at all. */}
      {weather.cloud < 0.7 && (
        <Stars
          radius={620}
          depth={90}
          count={2600}
          factor={5.5}
          saturation={0}
          speed={0.5}
          fade
        />
      )}
      {/* Haze, so the far side of the island falls away into the dark. */}
      <fogExp2 attach="fog" args={['#0b1a2e', 0.0042 + weatherHaze(weather)]} />

      {weather.cloud < 0.85 && weather.fog < 0.5 && (
        <group ref={moon}>
          <group position={[-330, 250, -300]}>
            <mesh>
              <sphereGeometry args={[26, 20, 16]} />
              <meshBasicMaterial color="#f4f1e0" />
            </mesh>
            {/* Two soft discs behind it stand in for a halo. */}
            <mesh position={[0, 0, -2]}>
              <circleGeometry args={[42, 24]} />
              <meshBasicMaterial color="#cfe0ff" transparent opacity={0.16} />
            </mesh>
            <mesh position={[0, 0, -4]}>
              <circleGeometry args={[74, 24]} />
              <meshBasicMaterial color="#9fc0ff" transparent opacity={0.08} />
            </mesh>
          </group>
        </group>
      )}

      {/* Moonlight: cold, dim, and from the same side as the moon. */}
      <hemisphereLight args={['#2b3f66', '#101a24', 0.5 * dim]} />
      <ambientLight intensity={0.1 * dim} color="#7f95c4" />
      <directionalLight
        position={[-120, 110, -100]}
        intensity={0.55 * dim}
        color="#aec6ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0009}
        shadow-normalBias={0.05}
        shadow-camera-near={1}
        shadow-camera-far={420}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      {/* The square keeps a warm pool of its own, standing in for the ring of
          lamps around it without paying for a light per lamp. Lamps are not
          dimmed by cloud, only by the hide-and-seek blackout. */}
      <pointLight
        position={[0, 9, 0]}
        intensity={90 * hidden * hidden}
        distance={46}
        decay={1.6}
        color="#ffd9a0"
      />
    </>
  )
}
