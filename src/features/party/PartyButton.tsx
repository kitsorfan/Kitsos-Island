import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import { PARTY_BUTTON } from './partyData'
import { partyBeat } from './partyLogic'
import { groundHeight } from '../island/terrainLogic'
import { useGame } from '../../shared/state/store'
import { TextPlane } from '../../shared/engine/TextSign'

/**
 * The big red button, across Collaboration Road from the games board.
 *
 * It stands in the square by day too — an invisible thing you can walk into
 * would be worse than a dead one you can look at — but it only has anything
 * to switch on after dark.
 */
export function PartyButton() {
  const [x, z] = PARTY_BUTTON.position
  const y = groundHeight(x, z)
  const night = useGame((s) => s.night)
  const party = useGame((s) => s.party)
  const dome = useRef<Mesh>(null)

  useFrame((state) => {
    if (!dome.current) return
    const material = dome.current.material as MeshStandardMaterial
    if (party) {
      // Pressed in, and pulsing with whatever the square is dancing to.
      const beat = Math.abs(Math.sin(partyBeat() * Math.PI))
      dome.current.position.y = 1.06
      material.emissiveIntensity = 0.9 + beat * 1.9
    } else {
      dome.current.position.y =
        1.18 + Math.sin(state.clock.elapsedTime * 2) * 0.012
      material.emissiveIntensity = night ? 0.75 : 0.06
    }
  })

  return (
    <group position={[x, y, z]} rotation={[0, PARTY_BUTTON.facing, 0]}>
      {/* Plinth */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 1.0, 0.84, 12]} />
        <meshStandardMaterial color="#d8cdb4" flatShading roughness={1} />
      </mesh>
      {/* Housing */}
      <mesh position={[0, 0.94, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.8, 0.24, 14]} />
        <meshStandardMaterial color="#2f3542" flatShading roughness={0.7} />
      </mesh>
      {/* Chrome ring the dome sits in */}
      <mesh position={[0, 1.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.07, 8, 18]} />
        <meshStandardMaterial
          color="#b9c2cf"
          roughness={0.35}
          metalness={0.6}
        />
      </mesh>

      {/* The button itself */}
      <mesh ref={dome} position={[0, 1.18, 0]} castShadow>
        <sphereGeometry args={[0.58, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#e0342f"
          emissive="#ff5a4a"
          emissiveIntensity={0.06}
          roughness={0.35}
          flatShading
        />
      </mesh>

      {/* Its plate, which says what it is for */}
      <mesh position={[0, 0.62, 0.92]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[1.5, 0.42]} />
        <meshStandardMaterial color="#1d2028" roughness={0.8} />
      </mesh>
      <TextPlane
        text={party ? 'PRESS TO STOP' : 'PARTY'}
        width={1.36}
        aspect={7}
        color={night ? '#ffd166' : '#8b8577'}
        outline="#0f1116"
        position={[0, 0.63, 0.94]}
        rotation={[-0.35, 0, 0]}
      />

      {/* After dark it is worth being seen from across the square. */}
      {night && (
        <>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[1.05, 12, 10]} />
            <meshBasicMaterial
              color="#ff5a4a"
              transparent
              opacity={party ? 0.24 : 0.13}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0, 1.4, 0]}
            intensity={party ? 26 : 10}
            distance={12}
            decay={1.6}
            color="#ff7a5a"
          />
        </>
      )}
    </group>
  )
}
