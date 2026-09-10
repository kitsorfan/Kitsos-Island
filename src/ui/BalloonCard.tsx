import {
  CALL_TOTAL,
  CONFETTI_CALLS,
  WATER_CALLS,
  STOCK_MAX,
} from '../game/balloon'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useCoarsePointer } from './useCoarsePointer'

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** The briefing before a flight, and the card at the end of one. */
export function BalloonCard() {
  const flight = useGame((s) => s.balloon)
  const begin = useGame((s) => s.beginBalloon)
  const exit = useGame((s) => s.exitBalloon)
  const again = useGame((s) => s.openBalloon)
  const coarse = useCoarsePointer()

  if (!flight) return null
  const briefing = flight.status === 'briefing'
  // Parcels that found somebody who wanted them, out of everything dropped.
  // One well-placed burst can serve two neighbours, so this is capped.
  const aim = flight.dropped
    ? Math.min(100, Math.round((flight.served / flight.dropped) * 100))
    : 0

  return (
    <div className="overlay">
      <div className="bl-card">
        <span className="bl-card__kicker">
          {briefing ? 'Balloon drop' : `Flight ${flight.round}`}
        </span>
        <h2 className="bl-card__title">
          {briefing ? 'Up over the town' : 'Nobody left waiting'}
        </h2>

        {briefing ? (
          <>
            <p className="bl-card__lead">
              It is festival afternoon, and the balloon is tethered on
              Collaboration Road. <strong>{CALL_TOTAL} gatherings</strong> are
              spread
              across the island below, and every one of them is waiting on
              something out of your basket.
            </p>

            <div className="bl-wants">
              <div className="bl-want bl-want--water">
                <span className="bl-want__icon" aria-hidden>
                  💧
                </span>
                <strong>{WATER_CALLS} want a water bomb</strong>
                <p>
                  Out in the sun on the roads and the parade ground. A bomb
                  drops like a stone, so it lands close to under you — and
                  everyone it catches scatters, hands over their heads.
                </p>
              </div>
              <div className="bl-want bl-want--confetti">
                <span className="bl-want__icon" aria-hidden>
                  🎉
                </span>
                <strong>{CONFETTI_CALLS} want confetti</strong>
                <p>
                  Something to celebrate, at the doors and in the gardens.
                  Confetti floats down, so it drifts a long way past the bomb,
                  and everyone under it cheers.
                </p>
              </div>
            </div>

            <dl className="bl-keys">
              {coarse ? (
                <>
                  <div><dt>Drift</dt><dd>Stick</dd></div>
                  <div><dt>Climb</dt><dd>Hold BURN</dd></div>
                  <div><dt>Water bomb</dt><dd>💧 button</dd></div>
                  <div><dt>Confetti</dt><dd>🎉 button</dd></div>
                </>
              ) : (
                <>
                  <div><dt>Lean into the drift</dt><dd>W and S</dd></div>
                  <div><dt>Swing the basket</dt><dd>A and D</dd></div>
                  <div><dt>Burner — climb</dt><dd>Hold Shift</dd></div>
                  <div><dt>Vent — drop</dt><dd>Hold Ctrl</dd></div>
                  <div><dt>Water bomb</dt><dd>Space</dd></div>
                  <div><dt>Confetti</dt><dd>F</dd></div>
                  <div><dt>Map</dt><dd>M</dd></div>
                  <div><dt>Come down</dt><dd>Esc</dd></div>
                </>
              )}
            </dl>

            <ul className="bl-card__rules">
              <li>
                Two rings follow you across the grass — the blue one is where a
                bomb would land, the pink one where confetti would. Line the
                right ring up with the right gathering.
              </li>
              <li>
                The basket holds {STOCK_MAX} of each and a fresh one comes up
                every couple of seconds, so there is no running out — only
                waiting.
              </li>
              <li>
                Drop the wrong thing on somebody and they stay on the list.
                Nothing is timed against you; the clock only counts the flight.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="bl-card__lead">
              All {CALL_TOTAL} of them served, and the whole island seen from
              the one place you cannot walk to.
            </p>
            <div className="bl-card__score">
              <div>
                <span>Served</span>
                <strong>
                  {flight.served}/{CALL_TOTAL}
                </strong>
              </div>
              <div>
                <span>Parcels dropped</span>
                <strong>{flight.dropped}</strong>
              </div>
              <div>
                <span>On the mark</span>
                <strong>{aim}%</strong>
              </div>
              <div>
                <span>Wrong parcel</span>
                <strong>{flight.wrong}</strong>
              </div>
              <div>
                <span>Time aloft</span>
                <strong>{clock(flight.seconds)}</strong>
              </div>
            </div>
          </>
        )}

        <div className="bl-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : again())}
          >
            {briefing ? 'Cast off' : 'Fly again'}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            Come down
          </button>
        </div>
      </div>
    </div>
  )
}
