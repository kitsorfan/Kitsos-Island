import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import type { Group } from 'three'
import { NPCS } from '../data/world'
import { terrainHeight } from '../game/terrain'
import { useGame } from '../state/store'
import { Character } from './Character'
import { PLAYER_POS } from './Player'
import type { Npc } from '../types'

export function Npcs() {
  return (
    <group>
      {NPCS.map((npc, i) => (
        <NpcActor key={npc.id} npc={npc} seed={i * 1.7} />
      ))}
    </group>
  )
}

function NpcActor({ npc, seed }: { npc: Npc; seed: number }) {
  const group = useRef<Group>(null)
  const marker = useRef<Group>(null)
  const met = useGame((s) => Boolean(s.visited[npc.id]))
  const [x, z] = npc.position
  const y = terrainHeight(x, z)

  useFrame((state, delta) => {
    if (!group.current) return

    // Turn to face the player once they are close enough to talk.
    const dx = PLAYER_POS.x - x
    const dz = PLAYER_POS.z - z
    const dist = Math.hypot(dx, dz)
    const desired = dist < 6 ? Math.atan2(dx, dz) : npc.facing

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
    <group position={[x, y, z]} rotation={[0, npc.facing, 0]} ref={group}>
      <Character colors={npc.colors} prop={npc.prop} seed={seed} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.5, 14]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.2} />
      </mesh>
      {!met && (
        <Billboard>
          <group ref={marker} position={[0, 2.6, 0]} scale={1.35}>
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
