import { SOULS } from '../game/rescue'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useCoarsePointer } from './useCoarsePointer'

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** The briefing before a run, and the card at the end of one. */
export function RescueCard() {
  const run = useGame((s) => s.rescue)
  const begin = useGame((s) => s.beginRescue)
  const exit = useGame((s) => s.exitRescue)
  const again = useGame((s) => s.openRescue)
  const coarse = useCoarsePointer()

  if (!run) return null
  const briefing = run.status === 'briefing'

  return (
    <div className="overlay">
      <div className="rescue-card">
        <span className="rescue-card__kicker">
          {briefing ? 'Mayday' : `Run ${run.round}`}
        </span>
        <h2 className="rescue-card__title">
          {briefing
            ? 'Take the lifeboat out'
            : run.won
              ? 'Everyone aboard'
              : 'A flare went out'}
        </h2>

        {briefing ? (
          <>
            <p className="rescue-card__lead">
              A boat went down off the coast in the night and her people are in
              the water in rafts. <strong>{SOULS} of them</strong> will put up
              hand flares over the next few minutes, and a hand flare burns for
              a little over a minute. After that there is nothing left out there
              to steer by.
            </p>

            <dl className="rescue-keys">
              {coarse ? (
                <>
                  <div>
                    <dt>Throttle</dt>
                    <dd>Stick</dd>
                  </div>
                  <div>
                    <dt>Astern</dt>
                    <dd>Pull the stick back</dd>
                  </div>
                  <div>
                    <dt>Helm</dt>
                    <dd>Stick left and right</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>Throttle</dt>
                    <dd>W</dd>
                  </div>
                  <div>
                    <dt>Astern</dt>
                    <dd>S</dd>
                  </div>
                  <div>
                    <dt>Helm</dt>
                    <dd>A and D</dd>
                  </div>
                  <div>
                    <dt>Chart</dt>
                    <dd>M</dd>
                  </div>
                  <div>
                    <dt>Put in</dt>
                    <dd>Esc</dd>
                  </div>
                </>
              )}
            </dl>

            <ul className="rescue-card__rules">
              <li>
                Get alongside a raft and <strong>take the way off her</strong>.
                Nobody can climb a net at speed, so the last twenty metres are
                done on nothing but what she is already carrying.
              </li>
              <li>
                The ring on the water round the boat goes green the moment she
                is slow enough, and the ring round the raft fills as they come
                over. Open the throttle and it empties again.
              </li>
              <li>
                The panel lists every flare in the water, shortest first — and
                that order is the only real decision in the game. Let one burn
                out and the run is over.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="rescue-card__lead">
              {run.won
                ? 'Every one of them off the water and under the shelter aft. They will all have a story about the boat that came.'
                : 'One of the flares went out before you got there, and a raft in the dark is a raft nobody finds. The others are still out there.'}
            </p>
            <div className="rescue-card__score">
              <div>
                <span>Taken aboard</span>
                <strong>
                  {run.saved}/{SOULS}
                </strong>
              </div>
              <div>
                <span>Time at sea</span>
                <strong>{clock(run.seconds)}</strong>
              </div>
            </div>
          </>
        )}

        <div className="rescue-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : again())}
          >
            {briefing ? 'Cast off' : 'Out again'}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            Back on the dock
          </button>
        </div>
      </div>
    </div>
  )
}
