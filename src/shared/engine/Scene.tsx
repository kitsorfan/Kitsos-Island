import { Interior } from '../../features/interior/Interior'
import { Island } from '../../features/island/Island'
import { Space } from '../../features/launch/Space'
import { useGame } from '../state/store'

/**
 * Only one area is mounted at a time: the island, the room you walked into,
 * or open space once the engines have cut.
 *
 * Space is keyed off the mode rather than the area because it is not
 * somewhere he walked to - the lighthouse is still the area he is in, and
 * flying home has to put him back on its doorstep. What changed is that he
 * is outside the ship rather than in it, which is also the whole reason he
 * can move freely out there: a cabin is a room with walls.
 */
export function Scene() {
  const area = useGame((s) => s.area)
  const orbiting = useGame((s) => s.mode === 'orbit')
  if (orbiting) return <Space />
  return area === 'island' ? <Island /> : <Interior id={area} />
}
