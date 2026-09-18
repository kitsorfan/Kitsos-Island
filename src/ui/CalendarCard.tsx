import {
  MONTH_LENGTHS,
  MONTH_NAMES,
  MONTH_SHORT,
  nameOfDay,
} from '../game/calendar'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useT } from '../i18n/useT'

/**
 * The calendar, off the wall and in your hands.
 *
 * It opens on whatever it is turned to and says nothing about what any date
 * does, because the whole point is that one of them does something and you
 * have to find out which. The month is a row of twelve; the day is a grid,
 * which is the only control that makes a date feel like a date rather than a
 * number in a box.
 *
 * February gets twenty-nine days every year. Nobody is booking a flight.
 */
export function CalendarCard() {
  const t = useT()
  const date = useGame((s) => s.calendar)
  const setCalendar = useGame((s) => s.setCalendar)
  const close = useGame((s) => s.closeCalendar)
  const christmas = useGame((s) => s.christmas)

  const days = MONTH_LENGTHS[date.month - 1]
  const named = nameOfDay(date)

  return (
    <div className="overlay">
      <div className={`wallcal${christmas ? ' wallcal--feast' : ''}`}>
        <div className="wallcal__head">
          <div>
            <span className="wallcal__kicker">{t('The basement wall')}</span>
            <h2 className="wallcal__title">{t('The calendar')}</h2>
          </div>
          <button
            className="panel__close"
            onClick={() => close()}
            aria-label={t('Close')}
          >
            ✕
          </button>
        </div>

        <div className="wallcal__months" role="group" aria-label={t('Month')}>
          {MONTH_SHORT.map((short, i) => (
            <button
              key={short}
              className={`chip${date.month === i + 1 ? ' chip--on' : ''}`}
              aria-pressed={date.month === i + 1}
              aria-label={t(MONTH_NAMES[i])}
              onClick={() =>
                setCalendar({
                  month: i + 1,
                  // A short month keeps the day in range rather than
                  // silently snapping it somewhere the visitor did not ask.
                  day: Math.min(date.day, MONTH_LENGTHS[i]),
                })
              }
            >
              {t(short)}
            </button>
          ))}
        </div>

        <div className="wallcal__days" role="group" aria-label={t('Day')}>
          {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              className={`wallcal__day${date.day === day ? ' wallcal__day--on' : ''}`}
              aria-pressed={date.day === day}
              onClick={() => setCalendar({ day, month: date.month })}
            >
              {day}
            </button>
          ))}
        </div>

        <p className="wallcal__read">
          {date.day} {t(MONTH_NAMES[date.month - 1])}
        </p>

        {/* Two days in the year have a name written under them. */}
        {named && <p className="wallcal__named">{t(named)}</p>}

        {christmas && (
          <p className="wallcal__note">
            {t(
              'Everyone is downstairs. Both families, the tree, and the meal he has hosted every year of his life.',
            )}
          </p>
        )}

        <button
          className="chip"
          onClick={() => {
            sfx.confirm()
            close()
          }}
        >
          {t('Hang it back up')}
        </button>
      </div>
    </div>
  )
}
