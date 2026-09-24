import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PLAYER_COLORS } from '../../features/island/world'
import { NAME, PROFILE } from '../../features/cv/profile'
import { useGame } from '../state/store'
import { Character } from '../../features/player/Character'
import * as sfx from '../engine/audio'
import { useT } from '../i18n/useT'

/**
 * The shortcut out of the game. Always reachable, so nobody who just wants the
 * CV or a way to get in touch has to hunt for five keys first.
 */
export function Greeting() {
  const t = useT()
  const closeGreeting = useGame((s) => s.closeGreeting)
  const unlockCv = useGame((s) => s.unlockCv)
  const openContact = useGame((s) => s.openContact)
  const cvUnlocked = useGame((s) => s.cvUnlocked)

  const portrait = useRef<HTMLDivElement>(null)
  /** Cursor direction from the figure's head, in -1..1. */
  const look = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))

    const follow = (event: PointerEvent) => {
      const box = portrait.current?.getBoundingClientRect()
      if (!box) return
      // Measure from roughly where his head is, not the panel's centre.
      const originX = box.left + box.width / 2
      const originY = box.top + box.height * 0.33
      look.current.x = clamp((event.clientX - originX) / (box.width * 1.8))
      look.current.y = clamp((event.clientY - originY) / (box.height * 0.9))
    }

    window.addEventListener('pointermove', follow)
    return () => window.removeEventListener('pointermove', follow)
  }, [])

  const dismiss = () => {
    sfx.cancel()
    closeGreeting()
  }

  return (
    <div className="overlay" onPointerDown={dismiss}>
      <section
        className="greeting"
        onPointerDown={(e) => e.stopPropagation()}
        style={{ '--accent': '#f0a33c' } as React.CSSProperties}
        aria-label={t('A word from Kitsos')}
      >
        <div className="greeting__portrait" ref={portrait}>
          <Canvas
            camera={{ fov: 30, position: [0, 0.1, 5.7] }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={1.1} />
            <hemisphereLight args={['#fff4e2', '#8a7f9a', 0.8]} />
            <directionalLight
              position={[3, 5, 4]}
              intensity={1.7}
              color="#fff4dd"
            />
            <directionalLight
              position={[-4, 2, 2]}
              intensity={0.5}
              color="#bcd4ff"
            />
            <group position={[0, -1.15, 0]}>
              <Character colors={PLAYER_COLORS} wave look={look} />
            </group>
          </Canvas>
          <span className="greeting__name">{NAME}</span>
        </div>

        <div className="greeting__body">
          <button
            className="greeting__close"
            onClick={dismiss}
            aria-label={t('Close')}
          >
            ✕<kbd>Esc</kbd>
          </button>

          <p className="greeting__kicker">
            {t('A word from the island’s owner')}
          </p>
          <h2 className="greeting__title">{t('Hey, nice to meet you!')}</h2>

          <div className="greeting__speech">
            <p>
              <strong>{t('Fair warning: you’ll miss all the fun.')}</strong>{' '}
              {t(
                'The island is the good part: the people, the buildings, the five keys and the lighthouse at the end of it.',
              )}
            </p>
            <p>
              {t(
                'But I genuinely appreciate the time you spend on my island, and I know a CV is sometimes just a thing you need right now. So here it is, no keys required.',
              )}
            </p>
            <p>
              {t(
                'Either way, I would be very happy to connect. Say hello and I will answer. There is no one else on the other end.',
              )}
            </p>
          </div>

          <div className="greeting__actions">
            <button
              className="button button--primary"
              onClick={() => {
                sfx.jingle()
                unlockCv()
              }}
            >
              🔓{' '}
              {t(cvUnlocked ? 'Open the full CV again' : 'Unlock the full CV')}
            </button>
            <button
              className="button"
              onClick={() => {
                sfx.confirm()
                openContact()
              }}
            >
              📡 {t('Send me a message')}
            </button>
          </div>

          <div className="greeting__links">
            <a href={`mailto:${PROFILE.email}`} onClick={() => sfx.confirm()}>
              {PROFILE.email}
            </a>
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={() => sfx.confirm()}
            >
              {PROFILE.linkedinLabel}
            </a>
          </div>

          <button className="greeting__back" onClick={dismiss}>
            {t('…actually, let me explore the island')}
          </button>
        </div>
      </section>
    </div>
  )
}
