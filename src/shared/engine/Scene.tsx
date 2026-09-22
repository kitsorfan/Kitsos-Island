import { Interior } from '../../features/interior/Interior'
import { Island } from '../../features/island/Island'
import { useGame } from '../state/store'

/**
 * Only one area is mounted at a time: the island, or the room you walked into.
 * Swapping them keeps the draw call count low and lets each light itself.
 */
export function Scene() {
  const area = useGame((s) => s.area)
  return area === 'island' ? <Island /> : <Interior id={area} />
}
