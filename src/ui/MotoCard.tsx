import { GRADES, LAP_CHOICES, LAP_LENGTH, RIVALS, racerName } from '../game/moto'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useCoarsePointer } from './useCoarsePointer'
import { useT } from '../i18n/useT'

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const t = Math.floor((seconds * 10) % 10)
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}.${t}` : `${s}.${t}s`
}

const ORDINAL = ['', 'First', 'Second', 'Third', 'Fourth']
const LAP_WORD: Record<number, string> = { 1: 'One', 3: 'Three', 5: 'Five' }

/**
 * Three bars, filled to the grade's rank. A meter says how hard this is at a
 * glance and in any language, which three names on their own never did.
 */
function GradeMeter({ rank }: { rank: number }) {
  return (
    <svg className="grade__meter" viewBox="0 0 32 20" aria-hidden focusable="false">
      {[0, 1, 2].map((i) => {
        const height = 7 + i * 6
        return (
          <rect
            key={i}
            x={i * 11}
            y={20 - height}
            width={8}
            height={height}
            rx={1.5}
            className={i < rank ? 'grade__bar grade__bar--on' : 'grade__bar'}
          />
        )
      })}
    </svg>
  )
}

/** The briefing before a race, and the card at the end of one. */
export function MotoCard() {
  const t = useT()
  const run = useGame((s) => s.moto)
  const setup = useGame((s) => s.motoSetup)
  const setSetup = useGame((s) => s.setMotoSetup)
  const begin = useGame((s) => s.beginMoto)
  const exit = useGame((s) => s.exitMoto)
  const again = useGame((s) => s.openMoto)
  const coarse = useCoarsePointer()

  if (!run) return null
  const briefing = run.status === 'briefing'
  const picked = GRADES.find((g) => g.id === setup.difficulty) ?? GRADES[1]
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
            ? `${LAP_WORD[setup.laps] ?? setup.laps} lap${setup.laps > 1 ? 's' : ''} of the island`
            : won
              ? 'Won it'
              : `${ORDINAL[run.place]} across the line`}
        </h2>

        {briefing ? (
          <>
            <p className="moto-card__lead">
              The ring road runs right round the town, through the woods and
              across all seven district roads —{' '}
              <strong>{Math.round(LAP_LENGTH)} metres</strong> of it,{' '}
              {setup.laps === 1 ? 'once' : `${setup.laps} times`}. Three of the
              islanders are on the grid ahead of you, and you start at the back
              of it.
            </p>

            <div className="race-board">
              <div className="race-board__field">
                <div className="race-board__head">
                  <span className="race-board__label">{t('Laps')}</span>
                  <span className="race-board__note">
                    {((LAP_LENGTH * setup.laps) / 1000).toFixed(2)} km
                  </span>
                </div>
                <div className="race-board__laps">
                  {LAP_CHOICES.map((laps) => (
                    <button
                      key={laps}
                      type="button"
                      className={`lap-chip${laps === setup.laps ? ' lap-chip--on' : ''}`}
                      aria-pressed={laps === setup.laps}
                      onClick={() => setSetup({ laps })}
                    >
                      {laps}
                    </button>
                  ))}
                </div>
              </div>

              <div className="race-board__field">
                <div className="race-board__head">
                  <span className="race-board__label">{t('Grade')}</span>
                </div>
                <div className="race-board__grades">
                  {GRADES.map((grade) => {
                    const on = grade.id === setup.difficulty
                    return (
                      <button
                        key={grade.id}
                        type="button"
                        className={`grade${on ? ' grade--on' : ''}`}
                        style={{ '--tint': grade.tint } as React.CSSProperties}
                        aria-pressed={on}
                        onClick={() => setSetup({ difficulty: grade.id })}
                      >
                        <GradeMeter rank={grade.rank} />
                        <span className="grade__name">{t(grade.label)}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="race-board__blurb">{t(picked.blurb)}</p>
              </div>
            </div>

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
                  <div>
                    <dt>{t('Ride')}</dt>
                    <dd>{t('Stick')}</dd>
                  </div>
                  <div>
                    <dt>{t('Brake')}</dt>
                    <dd>{t('Pull the stick back')}</dd>
                  </div>
                  <div>
                    <dt>{t('Wheelie')}</dt>
                    <dd>{t('Hold WHEELIE')}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>{t('Gas')}</dt>
                    <dd>W</dd>
                  </div>
                  <div>
                    <dt>{t('Brake')}</dt>
                    <dd>S</dd>
                  </div>
                  <div>
                    <dt>{t('Steer')}</dt>
                    <dd>{t('A and D')}</dd>
                  </div>
                  <div>
                    <dt>{t('Wheelie')}</dt>
                    <dd>{t('Hold Space')}</dd>
                  </div>
                  <div>
                    <dt>{t('Map')}</dt>
                    <dd>M</dd>
                  </div>
                  <div>
                    <dt>{t('Retire')}</dt>
                    <dd>{t('Esc')}</dd>
                  </div>
                </>
              )}
            </dl>

            <ul className="moto-card__rules">
              <li>
                {t(
                  'Stay on the tarmac. The grass will not hold a bike much above half speed, and the forest between the roads is thick.',
                )}
              </li>
              <li>
                {t(
                  'Cutting the middle of the island does not shorten the lap — you have to come past every sector of the circuit for it to count.',
                )}
              </li>
              <li>
                {t(
                  'Sit right behind one of them and the tow pulls you along faster than the bike will go on its own. That is the way past on a road this narrow.',
                )}
              </li>
              <li>
                {t(
                  'A shoulder in the corners costs a little speed and no more. They will give you room if you are quicker.',
                )}
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="moto-card__lead">
              {won
                ? 'Round the ring road, and nobody came past you on the last lap.'
                : podium
                  ? 'On the podium, and close enough to see the winner over the line.'
                  : 'Round the back of the field the whole way. The line is there to be learned.'}
            </p>
            <div className="moto-card__score">
              <div>
                <span>{t('Finished')}</span>
                <strong>{ORDINAL[run.place] || '—'}</strong>
              </div>
              <div>
                <span>{t('Race time')}</span>
                <strong>{clock(run.seconds)}</strong>
              </div>
              <div>
                <span>{t('Best lap')}</span>
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
