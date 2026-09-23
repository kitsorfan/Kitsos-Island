/**
 * What the visitor has actually won, and the stickers that go on the
 * certificate for it.
 *
 * Six of them for five games, because hide and seek is two games wearing one
 * name: seeking them out in the dark and being the one hidden are different
 * skills and are won separately, so they are worth a sticker each.
 *
 * A trophy is awarded once and kept. Losing afterwards does not take it back
 * — this is a record of what somebody managed, not a current standing.
 */

/** Every sticker the certificate can carry, in the order they are laid out. */
export type TrophyId =
  'paintball' | 'moto' | 'balloon' | 'rescue' | 'hide-seeking' | 'hide-hiding'

export interface Trophy {
  id: TrophyId
  /** What it is called on the certificate, under the icon. */
  label: string
  /** The ring and the mark, so the six read as a set at a glance. */
  color: string
  /**
   * Which icon `drawTrophy` puts inside the ring. Kept as a name rather than
   * a path because every one of them is drawn, not fetched.
   */
  icon: 'target' | 'bike' | 'balloon' | 'boat' | 'torch' | 'moon'
}

export const TROPHIES: Trophy[] = [
  { id: 'paintball', label: 'Paintball', color: '#e63c58', icon: 'target' },
  { id: 'moto', label: 'Circuit', color: '#f0a33c', icon: 'bike' },
  { id: 'balloon', label: 'Balloon', color: '#3fa9e8', icon: 'balloon' },
  { id: 'rescue', label: 'Sea Rescue', color: '#2f6fa8', icon: 'boat' },
  { id: 'hide-seeking', label: 'Seeking', color: '#8a9ad6', icon: 'torch' },
  { id: 'hide-hiding', label: 'Hiding', color: '#6b5ca5', icon: 'moon' },
]

export const TROPHY_BY_ID = new Map(TROPHIES.map((t) => [t.id, t]))

/** How many of the six have been won. */
export const trophyCount = (won: Record<string, true>) =>
  TROPHIES.filter((t) => won[t.id]).length

/** The won ones, in the order the certificate lays them out. */
export const wonTrophies = (won: Record<string, true>) =>
  TROPHIES.filter((t) => won[t.id])
