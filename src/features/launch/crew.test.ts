import { describe, expect, it } from 'vitest'
import { CREW, STORIED, buildCrew } from './crew'
import { NPCS } from '../island/world'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { LAUNCH_AREA } from './launch'

describe('the crew screen', () => {
  it('has everybody on the island on it, once each', () => {
    const ids = CREW.flatMap((g) => g.members.map((m) => m.npc.id))
    expect(ids).toHaveLength(NPCS.length)
    expect(new Set(ids).size).toBe(NPCS.length)
  })

  it('starts out on the island and ends at the thesis defence', () => {
    expect(CREW[0].id).toBe('island')
    expect(CREW.at(-1)!.id).toBe('lecture')
  })

  it('groups by building, not by floor', () => {
    /* The Work District has three floors of people and one heading. */
    const headings = CREW.map((g) => g.heading)
    expect(new Set(headings).size).toBe(headings.length)
    expect(headings).toContain('Work District')
  })

  it('names every group and every place in words, never by id', () => {
    for (const group of CREW) {
      expect(group.members.length).toBeGreaterThan(0)
      expect(group.heading).not.toMatch(/^[a-z]+(-[a-z]+)*$/)
      for (const m of group.members)
        expect(m.place).not.toMatch(/^[a-z]+(-[a-z]+)*$/)
    }
  })

  it('says when the ones who are not always there can be found', () => {
    const notes = CREW.flatMap((g) => g.members).filter((m) => m.note)
    for (const m of notes) {
      expect(m.npc.shift === 'night' || m.npc.feastOnly).toBe(true)
    }
  })

  it('counts only people with a story towards who he has met', () => {
    expect(STORIED.length).toBeGreaterThan(0)
    expect(STORIED.every((npc) => npc.journal)).toBe(true)
  })

  it('builds from whatever cast it is given', () => {
    expect(buildCrew([])).toEqual([])
  })

  it('is on the flight deck', () => {
    const room = INTERIOR_BY_ID.get(LAUNCH_AREA)!
    const screen = room.exhibits.find((e) => e.kind === 'crew')
    expect(screen).toBeDefined()
    /* On the east wall, clear of the logbook that shares it. */
    const logbook = room.exhibits.find((e) => e.id === 'lh-summary')!
    expect(Math.abs(screen!.position[1] - logbook.position[1])).toBeGreaterThan(
      5,
    )
  })
})
