import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'
import type { Npc } from '../../types'
import { CREW, STORIED } from './crew'

/**
 * What the crew screen opens: everybody on the island, a card each, grouped
 * by where they are to be found.
 *
 * The ones with a story to tell are ticked once he has heard it, so the
 * screen doubles as the last chance to see who he walked past. The rest are
 * townsfolk with nothing to file, and carry no tick either way - a cross
 * against somebody who has nothing to say would be a to-do list he cannot
 * finish.
 */
export function CrewRoster() {
  const t = useT()
  const visited = useGame((s) => s.visited)
  const groups = t(CREW)
  const met = STORIED.filter((npc) => visited[npc.id]).length

  return (
    <div className="crew">
      <p className="crew__count">
        {t('Met')} {met} {t('of the')} {STORIED.length}{' '}
        {t('with a story to tell.')}
      </p>
      {groups.map((group) => (
        <section key={group.id} className="panel__section crew__group">
          <h3 className="panel__heading">{group.heading}</h3>
          <ul className="crew__cards">
            {group.members.map(({ npc, place, note }) => {
              const known = Boolean(npc.journal && visited[npc.id])
              return (
                <li
                  key={npc.id}
                  className={`crew__card${known ? ' crew__card--met' : ''}`}
                >
                  <Portrait npc={npc} />
                  <div className="crew__who">
                    <span className="crew__name">{npc.name}</span>
                    <span className="crew__role">{npc.role}</span>
                    <span className="crew__place">
                      {place}
                      {note && ` · ${note}`}
                    </span>
                  </div>
                  {known && (
                    <span className="crew__met" aria-label={t('Met')}>
                      ✓
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

/**
 * A head-and-shoulders of a character, in the colours they walk about in.
 *
 * Flat shapes rather than a render of the 3D figure: fifty-odd canvases in a
 * scrolling panel would cost more than the whole island, and at this size
 * the hair, the shirt and the hat are what tell people apart anyway.
 */
function Portrait({ npc }: { npc: Npc }) {
  const { skin, hair, shirt } = npc.colors
  /* What is seen at the shoulders: the jacket if there is one, then the
     dress, then the shirt. */
  const top = npc.blazer ?? npc.dress ?? shirt
  const long = npc.hair === 'long'
  /* A child sits lower in the frame, so the row reads their height. */
  const drop = npc.child ? 5 : 0

  return (
    <svg className="crew__portrait" viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="24" fill="#dfeaf5" />
      <g transform={`translate(0 ${drop})`}>
        {long && (
          <rect x="13" y="12" width="22" height="24" rx="9" fill={hair} />
        )}
        <path d="M8 48 C8 36 15 32 24 32 C33 32 40 36 40 48 Z" fill={top} />
        {npc.blazer && (
          <path d="M20 33 L24 42 L28 33 Z" fill={npc.blouse ?? '#f4efe6'} />
        )}
        <rect x="21" y="27" width="6" height="6" fill={skin} />
        <circle cx="24" cy="20" r="9" fill={skin} />
        <path d="M15 19 C15 11 33 11 33 19 C30 15 18 15 15 19 Z" fill={hair} />
        <Hat prop={npc.prop} />
      </g>
    </svg>
  )
}

function Hat({ prop }: { prop: Npc['prop'] }) {
  switch (prop) {
    case 'cap':
      return (
        <>
          <path d="M15 17 C15 9 33 9 33 17 Z" fill="#c0392b" />
          <rect x="24" y="15.5" width="12" height="2.5" rx="1" fill="#932c22" />
        </>
      )
    case 'beret':
      return <ellipse cx="22" cy="12.5" rx="10" ry="4" fill="#3f4a2a" />
    case 'hardhat':
      return (
        <>
          <path d="M14.5 17 C14.5 8 33.5 8 33.5 17 Z" fill="#f0b429" />
          <rect x="13" y="16" width="22" height="2.4" rx="1" fill="#f0b429" />
        </>
      )
    case 'glasses':
      return (
        <g fill="#cfe6f5" stroke="#2f3542" strokeWidth="1.2">
          <circle cx="20.5" cy="21" r="2.6" />
          <circle cx="27.5" cy="21" r="2.6" />
          <path d="M23.1 21 L24.9 21" fill="none" />
        </g>
      )
    case 'headset':
      return (
        <g fill="none" stroke="#2f3542" strokeWidth="1.8">
          <path d="M14.5 21 C14.5 8 33.5 8 33.5 21" />
          <path d="M33 23 C31 27 28 28 26 28" strokeWidth="1.2" />
        </g>
      )
    default:
      return null
  }
}
