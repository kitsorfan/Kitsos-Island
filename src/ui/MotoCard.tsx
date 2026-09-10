import { LAPS, LAP_LENGTH, RIVALS, racerName } from '../game/moto'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useCoarsePointer } from './useCoarsePointer'

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const t = Math.floor((seconds * 10) % 10)
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}.${t}` : `${s}.${t}s`
}

const ORDINAL = ['', 'First', 'Second', 'Third', 'Fourth']

/** The briefing before a race, and the card at the end of one. */
export function MotoCard() {
  const run = useGame((s) => s.moto)
  const begin = useGame((s) => s.beginMoto)
  const exit = useGame((s) => s.exitMoto)
  const again = useGame((s) => s.openMoto)
  const coarse = useCoarsePointer()

  if (!run) return null
  const briefing = run.status === 'briefing'
  const won = run.place === 1
  const podium = run.place > 0 && run.place <= 3

  return (
    <div className="overlay">
      <div className="moto-card">
        <span className="moto-card__kicker">
          {briefing ? 'Island Circuit' : `Race ${run.round}`}
        </span>
        <h2 className="moto-card__title">
          {briefing
            ? 'Three laps of the island'
            : won
              ? 'Won it'
              : `${ORDINAL[run.place]} across the line`}
        </h2>

        {briefing ? (
          <>
            <p className="moto-card__lead">
              The ring road runs right round the town, through the woods and
              across all seven district roads —{' '}
              <strong>{Math.round(LAP_LENGTH)} metres</strong> of it, {LAPS}{' '}
              times. Three of the islanders are on the grid ahead of you, and
              you start at the back of it.
            </p>

            <ul className="moto-grid">
              {RIVALS.map((rival) => (
                <li key={rival.id}>
                  <span
                    className="moto-grid__chip"
                    style={{ background: rival.bike }}
                    aria-hidden
                  />
                  <strong>{racerName(rival.id)}</strong>
                </li>
              ))}
            </ul>

            <dl className="moto-keys">
              {coarse ? (
                <>
                  <div><dt>Ride</dt><dd>Stick</dd></div>
                  <div><dt>Brake</dt><dd>Pull the stick back</dd></div>
                  <div><dt>Wheelie</dt><dd>Hold WHEELIE</dd></div>
                </>
              ) : (
                <>
                  <div><dt>Gas</dt><dd>W</dd></div>
                  <div><dt>Brake</dt><dd>S</dd></div>
                  <div><dt>Steer</dt><dd>A and D</dd></div>
                  <div><dt>Wheelie</dt><dd>Hold Space</dd></div>
                  <div><dt>Map</dt><dd>M</dd></div>
                  <div><dt>Retire</dt><dd>Esc</dd></div>
                </>
              )}
            </dl>

            <ul className="moto-card__rules">
              <li>
                Stay on the tarmac. The grass will not hold a bike much above
                half speed, and the forest between the roads is thick.
              </li>
              <li>
                Cutting the middle of the island does not shorten the lap —
                you have to come past every sector of the circuit for it to
                count.
              </li>
              <li>
                Sit right behind one of them and the tow pulls you along
                faster than the bike will go on its own. That is the way past
                on a road this narrow.
              </li>
              <li>
                A shoulder in the corners costs a little speed and no more.
                They will give you room if you are quicker.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="moto-card__lead">
              {won
                ? 'Three laps of the ring road, and nobody came past you on the last one.'
                : podium
                  ? 'On the podium, and close enough to see the winner over the line.'
                  : 'Round the back of the field for three laps. The line is there to be learned.'}
            </p>
            <div className="moto-card__score">
              <div>
                <span>Finished</span>
                <strong>{ORDINAL[run.place] || '—'}</strong>
              </div>
              <div>
                <span>Race time</span>
                <strong>{clock(run.seconds)}</strong>
              </div>
              <div>
                <span>Best lap</span>
                <strong>{run.best > 0 ? clock(run.best) : '—'}</strong>
              </div>
            </div>
          </>
        )}

        <div className="moto-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : again())}
          >
            {briefing ? 'On the grid' : 'Race again'}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            Off the bike
          </button>
        </div>
      </div>
    </div>
  )
}
