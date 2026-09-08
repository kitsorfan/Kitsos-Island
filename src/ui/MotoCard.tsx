import { COIN_TOTAL } from '../game/moto'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useCoarsePointer } from './useCoarsePointer'

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** The briefing before a ride, and the card at the end of one. */
export function MotoCard() {
  const run = useGame((s) => s.moto)
  const begin = useGame((s) => s.beginMoto)
  const exit = useGame((s) => s.exitMoto)
  const again = useGame((s) => s.openMoto)
  const coarse = useCoarsePointer()

  if (!run) return null
  const briefing = run.status === 'briefing'

  return (
    <div className="overlay">
      <div className="moto-card">
        <span className="moto-card__kicker">
          {briefing ? 'Island ride' : `Ride ${run.round}`}
        </span>
        <h2 className="moto-card__title">
          {briefing ? 'Take the bike out' : 'Every coin in'}
        </h2>

        {briefing ? (
          <>
            <p className="moto-card__lead">
              There are <strong>{COIN_TOTAL} coins</strong> out on the island,
              laid along the roads that leave the plaza — past the Academy, the
              Work District, the camp, the school, the radio mast, and out to
              the dock on the far shore. Ride through one to pick it up.
            </p>

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
                  <div><dt>Off the bike</dt><dd>Esc</dd></div>
                </>
              )}
            </dl>

            <ul className="moto-card__rules">
              <li>
                A gold arrow over the bike points at the nearest coin you have
                not picked up, and the map marks all of them.
              </li>
              <li>
                Stay on the roads. The forest between them is thick, and a tree
                will take your speed off you.
              </li>
              <li>
                Nothing is timed against you — the clock only counts how long
                the round trip took.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="moto-card__lead">
              All {COIN_TOTAL} of them, and a lap of the whole island to show
              for it.
            </p>
            <div className="moto-card__score">
              <div>
                <span>Coins</span>
                <strong>
                  {run.coins}/{COIN_TOTAL}
                </strong>
              </div>
              <div>
                <span>Time taken</span>
                <strong>{clock(run.seconds)}</strong>
              </div>
            </div>
          </>
        )}

        <div className="moto-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : again())}
          >
            {briefing ? 'Kick it over' : 'Ride again'}
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
