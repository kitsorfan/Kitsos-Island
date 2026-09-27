import { describe, expect, it } from 'vitest'
import { EL } from './el/index'
import * as world from '../../features/island/world'
import * as interiors from '../../features/interior/interiors'
import * as profile from '../../features/cv/profile'
import * as family from '../../features/npc/family'
import * as audience from '../../features/npc/audience'
import * as partyData from '../../features/party/partyData'
import * as minigames from '../../features/arcade/minigames'
import * as lecture from '../../features/lecture/lecture'
import * as credits from '../../features/launch/credits'
import * as crew from '../../features/launch/crew'
import * as trophies from '../../features/launch/trophies'
import * as army from '../../features/army/army'
import * as balloon from '../../features/balloon/balloonLogic'
import * as moto from '../../features/moto/motoLogic'
import { residentsOf } from '../../features/party/feast'

/**
 * Every line of the island, in Greek.
 *
 * The dictionary is keyed by the English, so a sentence added to the data and
 * never translated breaks nothing: it reads in English in the middle of a
 * Greek island, which is exactly how the Greek went patchy before. These walk
 * the data the way the translator walks it and name whatever they find with
 * no Greek to go to, so a gap fails here rather than on somebody's screen.
 */

/** Fields that hold ids, colours and wiring rather than anything anyone reads. */
const WIRING = new Set([
  'id',
  'kind',
  'color',
  'colors',
  'accent',
  'position',
  'facing',
  'door',
  'half',
  'building',
  'buildingId',
  'keyId',
  'gives',
  'needs',
  'to',
  'area',
  'prop',
  'hair',
  'shirt',
  'pants',
  'skin',
  'dress',
  'outfit',
  'shift',
  'tint',
  'bike',
  'icon',
  'look',
  'wall',
  'floor',
  'rug',
  'href',
  'url',
  'image',
  'photo',
  'file',
  'email',
  'website',
  'linkedin',
  'type',
  'mode',
  'side',
  'tone',
  'mood',
  'pose',
  'model',
  'mark',
  'code',
])

/** Prose, as opposed to an id: it has a space in it or starts in capitals. */
const readable = (text: string) =>
  /[A-Za-z]/.test(text) &&
  !/^(#|https?:|\/|mailto:)/.test(text) &&
  (/\s/.test(text) || /^[A-Z]/.test(text))

function untranslated(tables: Record<string, unknown>): string[] {
  const gaps = new Set<string>()
  const seen = new WeakSet<object>()
  const walk = (value: unknown) => {
    if (typeof value === 'string') {
      if (readable(value) && EL[value] === undefined) gaps.add(value)
      return
    }
    if (!value || typeof value !== 'object' || seen.has(value)) return
    seen.add(value)
    if (value instanceof Map) {
      for (const item of value.values()) walk(item)
      return
    }
    for (const [key, item] of Object.entries(value)) {
      if (!WIRING.has(key)) walk(item)
    }
  }
  walk(tables)
  return [...gaps]
}

describe('the Greek island', () => {
  it('has Greek for everything the islanders and the exhibits say', () => {
    expect(
      untranslated({
        world,
        interiors,
        profile,
        family,
        audience,
        partyData,
        minigames,
        lecture,
        credits,
        crew,
        trophies,
        army,
        balloon,
        moto,
      }),
    ).toEqual([])
  })

  it('has a whole phrase for every prompt, so no name is left unbent', () => {
    // The prompt is keyed verb and thing together, because Greek bends the
    // name to the verb. Without a phrase it falls back to the bare name,
    // which reads, but only just; these are the ones the island can show.
    const phrases: string[] = []
    const areas = ['island', ...interiors.INTERIORS.map((i) => i.id)]
    for (const area of areas) {
      for (const christmas of [false, true]) {
        for (const npc of residentsOf(area, christmas)) {
          phrases.push(`Talk to <b>${npc.name}</b>`)
        }
      }
    }
    for (const b of world.BUILDINGS) {
      phrases.push(`Enter <b>${b.name}</b>`)
      if (b.locksWith) phrases.push(`Unlock <b>${b.name}</b>`)
    }
    for (const sign of world.SIGNS) phrases.push(`Read <b>${sign.label}</b>`)
    phrases.push(`Read <b>${minigames.BOARD.label}</b>`)
    phrases.push(`Press <b>${partyData.PARTY_BUTTON.label}</b>`)
    phrases.push(`Talk to <b>${partyData.AMALIA.name}</b>`)
    for (const room of interiors.INTERIORS) {
      for (const e of room.exhibits) {
        const verb =
          e.kind === 'key'
            ? 'Search'
            : e.kind === 'calendar'
              ? 'Check'
              : e.kind === 'toy'
                ? 'Look at'
                : 'Examine'
        phrases.push(`${verb} <b>${e.label}</b>`)
      }
      for (const link of room.links ?? []) {
        if (link.kind === 'locked') phrases.push(`Try <b>${link.label}</b>`)
      }
    }
    expect([...new Set(phrases)].filter((p) => !EL[p])).toEqual([])
  })

  it('keeps every {slot} of the English in the Greek', () => {
    // A Greek sentence that dropped {count} would say nothing where the
    // number goes, and one that misspelt it would print the braces.
    const slots = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort()
    for (const [english, greek] of Object.entries(EL)) {
      expect(slots(greek), english).toEqual(slots(english))
    }
  })

  it('keeps every bold part of the English in the Greek', () => {
    const bold = (text: string) => (text.match(/<b>/g) ?? []).length
    for (const [english, greek] of Object.entries(EL)) {
      expect(bold(greek), english).toBe(bold(english))
    }
  })
})
