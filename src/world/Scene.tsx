import { Sky } from '@react-three/drei'
import { Buildings } from './Buildings'
import { Foliage } from './Foliage'
import { Npcs } from './Npcs'
import { Paths } from './Paths'
import { Player } from './Player'
import { Props } from './Props'
import { Terrain } from './Terrain'
import { Water } from './Water'

export function Scene() {
  return (
    <>
      <Sky
        distance={4500}
        sunPosition={[60, 34, 30]}
        inclination={0.52}
        azimuth={0.28}
        turbidity={5}
        rayleigh={1.4}
        mieCoefficient={0.006}
        mieDirectionalG={0.82}
      />

      <hemisphereLight args={['#cfe9ff', '#6d8f4c', 1.05]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[46, 58, 30]}
        intensity={2.1}
        color="#fff4dd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0008}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={190}
        shadow-camera-left={-62}
        shadow-camera-right={62}
        shadow-camera-top={62}
        shadow-camera-bottom={-62}
      />
      {/* Cool bounce from the sea, opposite the sun. */}
      <directionalLight position={[-40, 20, -30]} intensity={0.35} color="#9fd8ff" />

      <Terrain />
      <Water />
      <Paths />
      <Foliage />
      <Props />
      <Buildings />
      <Npcs />
      <Player />
    </>
  )
}
