import { useState } from 'react'
import { INTERIOR_BY_ID } from '../data/interiors'
import { pickUpToy } from '../game/examine'
import * as sfx from '../game/audio'
import { useGame } from '../state/store'
import { useT } from '../i18n/useT'

/**
 * The toys on the shelf, laid out the way they stand on it: the top board
 * across the top, then the middle, then the bottom.
 *
 * Only one of them does anything, and nothing here says which. That is the
 * whole puzzle — the helicopter is a toy among toys until you pick it up, and
 * the rotor turning is the only thing that marks it out, exactly as on the
 * shelf itself.
 */
const TOYS: { id: string; emoji: string; name: string; row: number }[] = [
  { id: 'bricks', emoji: '🧱', name: 'A handful of bricks', row: 0 },
  { id: 'rocket', emoji: '🚀', name: 'A tin rocket', row: 0 },
  {
    id: 'ball',
    emoji: '🏀',
    name: 'The ball that never went back in the box',
    row: 0,
  },
  { id: 'robot', emoji: '🤖', name: 'A tin robot', row: 1 },
  { id: 'dinosaur', emoji: '🦖', name: 'A green dinosaur', row: 1 },
  { id: 'helicopter', emoji: '🚁', name: 'A toy helicopter', row: 1 },
  { id: 'car', emoji: '🚗', name: 'A red car', row: 2 },
  { id: 'boat', emoji: '⛵', name: 'A wooden boat', row: 2 },
  {
    id: 'games',
    emoji: '🎲',
    name: 'Board games nobody has opened in years',
    row: 2,
  },
]

/** The one that is a switch. */
const SWITCH = 'helicopter'

export function ToyShelfCase() {
  const t = useT()
  const area = useGame((s) => s.area)
  const secrets = useGame((s) => s.secrets)
  const [tried, setTried] = useState<string | null>(null)

  const interior = INTERIOR_BY_ID.get(area)
  const exhibit = interior?.exhibits.find((e) => e.kind === 'toy')
  if (!interior || !exhibit) return null

  const done = Boolean(exhibit.reveals && secrets[exhibit.reveals.id])

  const take = (id: string, name: string) => {
    if (id !== SWITCH) {
      // Every other toy is just a toy. Say so and leave the shelf open.
      sfx.cancel()
      setTried(name)
      return
    }
    sfx.jingle()
    pickUpToy(exhibit, interior.name)
  }

  return (
    <div className="toyshelf">
      <div className="toyshelf__case">
        {[0, 1, 2].map((row) => (
          <div className="toyshelf__board" key={row}>
            {TOYS.filter((toy) => toy.row === row).map((toy) => (
              <button
                key={toy.id}
                className={`toyshelf__toy${
                  toy.id === SWITCH && done ? ' toyshelf__toy--found' : ''
                }`}
                onClick={() => take(toy.id, t(toy.name))}
                aria-label={t(toy.name)}
                title={t(toy.name)}
              >
                <span
                  className={
                    toy.id === SWITCH
                      ? 'toyshelf__emoji toyshelf__emoji--spin'
                      : 'toyshelf__emoji'
                  }
                >
                  {toy.emoji}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="toyshelf__note">
        {done
          ? t(
              'The helicopter goes down under your thumb, and somewhere in the wall something lets go.',
            )
          : tried
            ? `${tried} — ${t('just a toy.')}`
            : t('Pick one up.')}
      </p>
    </div>
  )
}
