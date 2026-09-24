import type { Npc } from '../../types'
import { NPCS } from '../island/world'
import { INTERIOR_BY_ID } from '../interior/interiors'

/**
 * The crew screen on the flight deck: everybody on the island, on one wall,
 * the last thing he looks at before he leaves them all behind.
 *
 * Built from `NPCS` rather than listed by hand, so a character added to the
 * island turns up on the screen without anybody remembering to put them
 * there. What this file decides is only the order and the grouping: out on
 * the island first, then each building in the order the world lists them,
 * and the thesis audience last, because they are only ever in one room for
 * one afternoon.
 */

export interface CrewMember {
  npc: Npc
  /** Where in the building, or where on the island, they are to be found. */
  place: string
  /** When they are there, for the ones who are not always. */
  note?: string
}

export interface CrewGroup {
  id: string
  heading: string
  members: CrewMember[]
}

const ISLAND = 'island'
const LECTURE = 'lecture'

/** Which group somebody belongs to: the building, not the floor of it. */
function groupOf(npc: Npc): string {
  if (npc.lectureOnly) return LECTURE
  if (npc.area === ISLAND) return ISLAND
  const room = INTERIOR_BY_ID.get(npc.area)
  return room?.building ?? room?.id ?? npc.area
}

function headingOf(group: string): string {
  if (group === ISLAND) return 'Out on the island'
  if (group === LECTURE) return 'At the thesis defence'
  return INTERIOR_BY_ID.get(group)?.name ?? group
}

function memberOf(npc: Npc): CrewMember {
  if (npc.area === ISLAND) {
    return {
      npc,
      place: 'Around the island',
      note: npc.shift === 'night' ? 'After dark' : undefined,
    }
  }
  const room = INTERIOR_BY_ID.get(npc.area)
  return {
    npc,
    place: room?.kicker ?? room?.name ?? npc.area,
    note: npc.feastOnly
      ? 'Christmas Day only'
      : npc.shift === 'night'
        ? 'After dark'
        : undefined,
  }
}

export function buildCrew(npcs: readonly Npc[]): CrewGroup[] {
  const groups = new Map<string, CrewGroup>()
  for (const npc of npcs) {
    const id = groupOf(npc)
    let group = groups.get(id)
    if (!group) {
      group = { id, heading: headingOf(id), members: [] }
      groups.set(id, group)
    }
    group.members.push(memberOf(npc))
  }

  /* The island first and the lecture last; the buildings keep the order
     the world lists their people in. */
  const rank = (g: CrewGroup) =>
    g.id === ISLAND ? 0 : g.id === LECTURE ? 2 : 1
  return [...groups.values()].sort((a, b) => rank(a) - rank(b))
}

export const CREW: CrewGroup[] = buildCrew(NPCS)

/** Everybody with a journal entry to file, which is who "met" counts. */
export const STORIED: Npc[] = NPCS.filter((npc) => npc.journal)
