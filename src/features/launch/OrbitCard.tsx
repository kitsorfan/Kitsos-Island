import { useEffect, useRef, useState } from 'react'
import {
  CERT_HEIGHT,
  CERT_TEXT,
  CERT_WIDTH,
  cleanName,
  downloadCertificate,
  drawCertificate,
  nameReady,
} from './certificate'
import { NAME_LIMIT } from './certificate'
import { downloadCv } from '../cv/downloadCv'
import * as sfx from '../../shared/engine/audio'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * The end of it: the island a long way below, and the prize.
 *
 * He types his name, watches it land on the certificate, and takes it away as
 * a picture. There is no button on this card that goes back — the walk is
 * over, and the card says so rather than pretending otherwise.
 */
export function OrbitCard() {
  const t = useT()
  const launch = useGame((s) => s.launch)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)

  const ready = nameReady(name)

  /* The preview is the certificate itself, drawn by the same function that
     writes the file — so what he is looking at cannot differ from what he
     gets. It redraws as he types, which is most of why the box is worth
     putting on the screen at all. */
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    drawCertificate(ctx, ready ? cleanName(name) : t('your name here'))
  }, [name, ready, t])

  const take = () => {
    if (!ready) return
    sfx.jingle()
    downloadCertificate(name)
    setSaved(true)
  }

  if (!launch?.arrived) return null

  return (
    <div className="overlay overlay--orbit">
      <section className="orbit" aria-label={t('In orbit')}>
        <span className="orbit__kicker">{t('Orbit')}</span>
        <h2 className="orbit__title">{t('You made it off the island')}</h2>

        <p className="orbit__lead">
          {t(
            'The lighthouse was a gantry all along, and the summit room was the flight deck. Kitsos Island is the blue-green shape under the window now, with every road you walked on it.',
          )}
        </p>

        <div className="orbit__cert">
          <canvas
            ref={canvas}
            className="orbit__canvas"
            width={CERT_WIDTH}
            height={CERT_HEIGHT}
            aria-label={t('Preview of your certificate')}
          />
        </div>

        <label className="orbit__field">
          <span className="orbit__label">{t('Put your name on it')}</span>
          <input
            className="orbit__input"
            value={name}
            maxLength={NAME_LIMIT}
            /* The name goes on a certificate and nowhere else: it is not
               saved, not sent anywhere, and there is no backend here to send
               it to. It lives in this component until the tab closes. */
            autoComplete="off"
            spellCheck={false}
            placeholder={t('Your name')}
            onChange={(e) => {
              setName(e.target.value)
              setSaved(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') take()
            }}
          />
        </label>

        <div className="orbit__actions">
          <button className="orbit__take" onClick={take} disabled={!ready}>
            {saved ? t('Saved — take another') : t('Take your certificate')}
          </button>
          <button
            className="orbit__cv"
            onClick={() => {
              sfx.confirm()
              downloadCv()
            }}
          >
            {t('And the full CV')}
          </button>
        </div>

        <p className="orbit__signoff">
          {t('Signed by')} <strong>{CERT_TEXT.signatory}</strong>.{' '}
          {t(
            'Thanks for walking the whole of it — there is no way back down from here.',
          )}
        </p>
      </section>
    </div>
  )
}
