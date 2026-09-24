import { NAME, PROFILE } from '../../features/cv/profile'
import { useGame } from '../state/store'
import * as sfx from '../engine/audio'
import { useT } from '../i18n/useT'

export function TitleScreen() {
  const start = useGame((s) => s.start)
  const openGreeting = useGame((s) => s.openGreeting)

  const begin = () => {
    sfx.jingle()
    start()
  }

  const t = useT()

  return (
    <div className="title">
      <div className="title__card">
        <p className="title__kicker">{t('A playable CV')}</p>
        <h1 className="title__logo">
          <span>{t('KITSOS')}</span>
          <span>{t('ISLAND')}</span>
        </h1>
        <p className="title__name">{NAME}</p>
        <p className="title__role">
          {t(PROFILE.title)} · {t(PROFILE.location)}
        </p>

        <p className="title__blurb">
          {t(
            'Walk the island, talk to the townspeople and step inside the buildings. Five keys are hidden across the districts, one per building. Find them all and the Old Lighthouse on the cape opens. The Radio Center down south sends a message straight to my inbox.',
          )}
        </p>

        <button className="button button--start" onClick={begin}>
          ▶ {t('Start exploring')}
        </button>

        <button
          className="title__skip"
          onClick={() => {
            sfx.confirm()
            openGreeting()
          }}
        >
          {t('In a hurry? Get the full CV and my contact details')} →
        </button>

        <ul className="title__keys">
          <li>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> {t('move')}
          </li>
          <li>
            <kbd>Shift</kbd> {t('sprint')}
          </li>
          <li>
            <kbd>Enter</kbd> {t('interact')}
          </li>
          <li>
            <kbd>Space</kbd> {t('jump')}
          </li>
          <li>
            <kbd>Q</kbd>
            <kbd>E</kbd> {t('turn camera')}
          </li>
          <li>
            <kbd>Z</kbd>
            <kbd>C</kbd> {t('zoom in and out')}
          </li>
          <li>
            <kbd>X</kbd> {t('out of his own eyes')}
          </li>
          <li>
            <kbd>M</kbd> {t('map & travel')}
          </li>
          <li>
            <kbd>J</kbd> {t('journal')}
          </li>
        </ul>
        <p className="title__touch">
          {t('On a phone? Use the stick and the A button.')}
        </p>
      </div>
    </div>
  )
}
