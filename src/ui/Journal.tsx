import { BUILDINGS, NPCS } from '../data/world'
import { TOTAL_ENTRIES, useGame } from '../state/store'
import * as sfx from '../game/audio'

const ORDER = [...NPCS.map((n) => n.id), ...BUILDINGS.map((b) => b.id)]

export function Journal() {
  const entries = useGame((s) => s.entries)
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
        aria-label="Journal"
      >
        <header className="panel__head">
          <div>
            <p className="panel__kicker">Field journal</p>
            <h2 className="panel__title">
              {found} of {TOTAL_ENTRIES} discovered
            </h2>
          </div>
          <button className="panel__close" onClick={dismiss} aria-label="Close">
            ✕<kbd>Esc</kbd>
          </button>
        </header>

        <div className="journal__meter">
          <div className="journal__fill" style={{ width: `${percent}%` }} />
        </div>

        <div className="panel__body">
          {found === 0 && (
            <p className="panel__text">
              Nothing yet. Talk to the townspeople and step into the buildings —
              everything you learn is filed here.
            </p>
          )}
          <div className="journal__grid">
            {ORDER.map((id) => {
              const entry = byId.get(id)
              if (!entry) {
                return (
                  <article key={id} className="journal-card journal-card--locked">
                    <h4>???</h4>
                    <p>Not discovered yet</p>
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

          {found === TOTAL_ENTRIES && (
            <p className="journal__complete">
              Island complete. You now know the whole CV — the Radio Center is
              waiting.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
