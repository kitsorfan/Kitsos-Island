import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CERT_HEIGHT,
  CERT_TEXT,
  CERT_WIDTH,
  cleanName,
  certDate,
  downloadCertificate,
  drawCertificate,
  nameReady,
} from './certificate'
import { NAME_LIMIT } from './certificate'
import { downloadCv } from '../cv/downloadCv'
import { formatSerial, mintSerial, signFor, verifyUrl } from './certId'
import { linkedinAddUrl, linkedinShareUrl } from './linkedin'
import { TROPHIES, trophyCount } from './trophies'
import * as sfx from '../../shared/engine/audio'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'

/**
 * The end of it: the island a long way below, and the prize.
 *
 * He types his name, watches it land on the certificate, and takes it away as
 * a picture. Then he flies home, which is the one way off this card: the
 * island is still down there, and he lands in the middle of it wearing the
 * shirt they give you for having gone up.
 */
export function OrbitCard() {
  const t = useT()
  const launch = useGame((s) => s.launch)
  const credits = useGame((s) => s.credits)
  const flyHome = useGame((s) => s.flyHome)
  const trophies = useGame((s) => s.trophies)
  /*
   * The serial, minted once when the card is first built rather than on
   * every render.
   *
   * It has to be stable: the preview he is looking at and the file he takes
   * away carry the same reference, and a number redrawn each frame would
   * make the certificate a different document every time he typed a letter
   * of his name. The signature half is another matter - it signs the name
   * too, so it moves as the name does, and settles when he stops typing.
   */
  const [serial] = useState(() => mintSerial())
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)

  const ready = nameReady(name)
  const stamp = useMemo(
    () => ({ serial, signature: signFor(serial, cleanName(name)) }),
    [serial, name],
  )
  const reference = formatSerial(stamp.serial, stamp.signature)

  /*
   * Whether the card is on screen at all, which the early return below acts
   * on — but the effect has to know it too. See the dependency list.
   */
  const showing = Boolean(launch?.arrived) && !credits

  /* The preview is the certificate itself, drawn by the same function that
     writes the file — so what he is looking at cannot differ from what he
     gets. It redraws as he types, which is most of why the box is worth
     putting on the screen at all. */
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    drawCertificate(
      ctx,
      ready ? cleanName(name) : t('your name here'),
      certDate(),
      { trophies, serial: stamp },
    )
    /*
     * `showing` is in here because the canvas does not exist until it is
     * true.
     *
     * The card is behind an early return: while the credits are rolling
     * this component renders null, so the first runs of this effect find
     * no canvas to draw on and quietly give up. Then the credits end, the
     * canvas mounts for the first time - and none of `name`, `ready` or `t`
     * has changed, so without `showing` the effect never runs again and the
     * certificate stays blank until the first keystroke paints it.
     */
  }, [name, ready, t, showing, trophies, stamp])

  const take = () => {
    if (!ready) return
    sfx.jingle()
    void downloadCertificate(name, { trophies, serial: stamp })
    setSaved(true)
  }

  /* Not until the roll has played out. The card is the end of the game and
     the credits are the end of the game; putting the card up over the first
     title is how you make sure nobody reads either. */
  if (!showing) return null

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

        {ready && (
          /* The two fields LinkedIn asks for when a certification is added,
             so they can be copied straight across - or skipped, since the
             link below fills them in. */
          <dl className="orbit__credential">
            <dt>{t('Credential ID')}</dt>
            <dd>{reference}</dd>
            <dt>{t('Credential URL')}</dt>
            <dd>
              <a
                href={verifyUrl(reference, cleanName(name))}
                target="_blank"
                rel="noreferrer"
              >
                {verifyUrl(reference, cleanName(name))}
              </a>
            </dd>
          </dl>
        )}

        <div className="orbit__linkedin">
          {/* The certificate needs a name to go on the profile; the island
              does not need one to be passed on. */}
          {ready && (
            <a
              className="orbit__share"
              href={linkedinAddUrl(reference, cleanName(name))}
              target="_blank"
              rel="noreferrer"
              onClick={() => sfx.confirm()}
            >
              {t('Add to your LinkedIn profile')}
            </a>
          )}
          <a
            className="orbit__share"
            href={linkedinShareUrl()}
            target="_blank"
            rel="noreferrer"
            onClick={() => sfx.confirm()}
          >
            {t('Share the island on LinkedIn')}
          </a>
        </div>

        <p className="orbit__stickers">
          {trophyCount(trophies) === TROPHIES.length
            ? t('Every island game won. All six stickers are on it.')
            : trophyCount(trophies) === 0
              ? t(
                  'No stickers on this one — the island games are still down there.',
                )
              : `${trophyCount(trophies)} / ${TROPHIES.length} ${t('island games won, and on the certificate.')}`}
        </p>

        <p className="orbit__signoff">
          {t('Signed by')} <strong>{CERT_TEXT.signatory}</strong>.{' '}
          {t('Thanks for walking the whole of it.')}
        </p>

        <button className="orbit__home" onClick={flyHome}>
          {t('Fly back down to the island')}
          <small>
            {saved
              ? t('Certificate saved. The shirt comes with the landing.')
              : t('You can take the certificate down with you either way.')}
          </small>
        </button>
      </section>
    </div>
  )
}
