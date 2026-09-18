import { KEYS, MISSIONS } from '../data/world'
import {
  CATALOGUE,
  TOTAL_ENTRIES,
  TOTAL_KEYS,
  keyCount,
  useGame,
} from '../state/store'
import * as sfx from '../game/audio'
import { useT } from '../i18n/useT'

/** One card per entry the island holds, found or not, in catalogue order. */
const ORDER = CATALOGUE.map((entry) => entry.id)

export function Journal() {
  const t = useT()
  const entries = t(useGame((s) => s.entries))
  const keys = useGame((s) => s.keys)
  const missions = useGame((s) => s.missions)
  const close = useGame((s) => s.closeJournal)
  const byId = new Map(entries.map((e) => [e.id, e]))
  const found = entries.length
  const percent = Math.round((found / TOTAL_ENTRIES) * 100)

  const dismiss = () => {
    sfx.cancel()
    close()
  }

  return (
    <div className="overlay" onPointerDown={dismiss}>
      <section
        className="panel panel--journal"
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={t('Journal')}
      >
        <header className="panel__head">
          <div>
            <p className="panel__kicker">{t('Field journal')}</p>
            <h2 className="panel__title">
              {found} {t('of')} {TOTAL_ENTRIES} {t('discovered')}
            </h2>
          </div>
          <button
            className="panel__close"
            onClick={dismiss}
            aria-label={t('Close')}
          >
            ✕<kbd>Esc</kbd>
          </button>
        </header>

        <div className="journal__meter">
          <div className="journal__fill" style={{ width: `${percent}%` }} />
        </div>

        <div className="panel__body">
          <section className="panel__section">
            <h3 className="panel__heading">
              {t('Keyring')}: {keyCount(keys)} {t('of')} {TOTAL_KEYS}
            </h3>
            <div className="keycard-row">
              {KEYS.map((key) => {
                const mission = MISSIONS.find((m) => m.keyId === key.id)
                const held = Boolean(keys[key.id])
                return (
                  <div
                    key={key.id}
                    className={`keycard${held ? ' keycard--held' : ''}`}
                    style={{ '--key': key.color } as React.CSSProperties}
                  >
                    <span className="keycard__icon">{held ? '🔑' : '🔒'}</span>
                    <strong>{held ? key.name : '???'}</strong>
                    <p>
                      {held
                        ? t(mission?.done ?? 'Taken.')
                        : mission
                          ? missions[mission.id] === 'active'
                            ? t(mission.hint)
                            : t(mission.brief)
                          : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="panel__section">
            <h3 className="panel__heading">{t('What you have learned')}</h3>
            {found === 0 && (
              <p className="panel__text">
                {t(
                  'Nothing yet. Talk to the townspeople and step into the buildings. Everything you learn is filed here.',
                )}
              </p>
            )}
            <div className="journal__grid">
              {ORDER.map((id) => {
                const entry = byId.get(id)
                if (!entry) {
                  return (
                    <article
                      key={id}
                      className="journal-card journal-card--locked"
                    >
                      <h4>???</h4>
                      <p>{t('Not discovered yet')}</p>
                    </article>
                  )
                }
                return (
                  <article key={id} className="journal-card">
                    <span className="journal-card__source">{entry.source}</span>
                    <h4>{entry.title}</h4>
                    <p>{entry.body}</p>
                  </article>
                )
              })}
            </div>
          </section>

          {found === TOTAL_ENTRIES && (
            <p className="journal__complete">
              {t(
                'Island complete. You now know the whole CV. The Radio Center is waiting.',
              )}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
