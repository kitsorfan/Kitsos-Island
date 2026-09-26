import { useEffect, useRef } from 'react'
import {
  dropHeld,
  firePointer,
  queueDrop,
  queueFire,
  queueInteract,
  queueJump,
  setKey,
  touchCrouch,
  touchStick,
} from './input'
import { useGame } from '../../shared/state/store'
import { dialogueBridge } from './useKeyboard'
import { useCoarsePointer } from '../../shared/ui/useCoarsePointer'
import { useScreen } from '../../shared/ui/useScreen'
import { LiftButtons } from '../balloon/LiftButtons'
import { useT } from '../../shared/i18n/useT'
import * as sfx from '../../shared/engine/audio'

const RADIUS = 52

export function TouchControls() {
  const t = useT()
  const coarse = useCoarsePointer()
  const { mobile } = useScreen()
  const mode = useGame((s) => s.mode)
  const fighting = useGame((s) => s.paintball?.status === 'playing')
  const riding = useGame((s) => s.moto?.status === 'riding')
  const flying = useGame((s) => s.balloon?.status === 'flying')
  const onWatch = useGame((s) => s.hide?.status === 'playing')
  /*
   * At the helm the stick is the whole of it: a raft comes aboard by itself
   * once the boat is alongside and slow, so there is nothing to jump over
   * and nothing to press A at.
   */
  const sailing = useGame((s) => s.rescue?.status === 'sailing')
  const openJournal = useGame((s) => s.openJournal)
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)

  useEffect(
    () => () => {
      touchStick.active = false
      touchStick.x = 0
      touchStick.y = 0
      touchCrouch.on = false
      firePointer.held = false
      dropHeld.water = false
      dropHeld.confetti = false
    },
    [],
  )

  if (!coarse || (mode !== 'explore' && mode !== 'dialogue')) return null

  const move = (event: React.PointerEvent) => {
    if (pointerId.current !== event.pointerId || !base.current) return
    const rect = base.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const dist = Math.min(RADIUS, Math.hypot(dx, dy))
    const angle = Math.atan2(dy, dx)
    const nx = (Math.cos(angle) * dist) / RADIUS
    const ny = (Math.sin(angle) * dist) / RADIUS

    touchStick.x = nx
    touchStick.y = -ny
    touchStick.active = true
    if (knob.current) {
      knob.current.style.transform = `translate(${nx * RADIUS}px, ${ny * RADIUS}px)`
    }
  }

  const release = () => {
    pointerId.current = null
    touchStick.active = false
    touchStick.x = 0
    touchStick.y = 0
    if (knob.current) knob.current.style.transform = 'translate(0px, 0px)'
  }

  return (
    <div className={`touch${mobile ? ' touch--mobile' : ''}`}>
      <div
        className="stick"
        ref={base}
        onPointerDown={(e) => {
          pointerId.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e)
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="stick__knob" ref={knob} />
      </div>

      <div className="touch__buttons">
        {mode === 'explore' &&
          !fighting &&
          !riding &&
          !flying &&
          !onWatch &&
          !sailing && (
            <>
              {/* A phone has the journal in its controls card already. */}
              {!mobile && (
                <button
                  className="round-button round-button--small"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    sfx.confirm()
                    openJournal()
                  }}
                >
                  J
                </button>
              )}
              <button
                className="round-button round-button--jump"
                onPointerDown={(e) => {
                  e.preventDefault()
                  queueJump()
                }}
                aria-label={t('Jump')}
              >
                ⤒
              </button>
            </>
          )}

        {onWatch ? (
          <button
            className="round-button round-button--pulse"
            onPointerDown={(e) => {
              e.preventDefault()
              queueFire()
            }}
            aria-label={t('Wide pulse')}
          >
            PULSE
          </button>
        ) : flying ? (
          <>
            {/* Up and down, the burner and the vent: let go of both and the
                balloon sinks back on its own, only slower. */}
            <LiftButtons look="round" />
            <button
              className="round-button round-button--water"
              onPointerDown={(e) => {
                e.preventDefault()
                dropHeld.water = true
                queueDrop('water')
              }}
              onPointerUp={() => {
                dropHeld.water = false
              }}
              onPointerCancel={() => {
                dropHeld.water = false
              }}
              onPointerLeave={() => {
                dropHeld.water = false
              }}
              aria-label={t('Drop a water bomb')}
            >
              💧
            </button>
            <button
              className="round-button round-button--confetti"
              onPointerDown={(e) => {
                e.preventDefault()
                dropHeld.confetti = true
                queueDrop('confetti')
              }}
              onPointerUp={() => {
                dropHeld.confetti = false
              }}
              onPointerCancel={() => {
                dropHeld.confetti = false
              }}
              onPointerLeave={() => {
                dropHeld.confetti = false
              }}
              aria-label={t('Throw confetti')}
            >
              🎉
            </button>
          </>
        ) : riding ? (
          <button
            className="round-button round-button--wheelie"
            onPointerDown={(e) => {
              e.preventDefault()
              setKey('Space', true)
            }}
            onPointerUp={() => setKey('Space', false)}
            onPointerCancel={() => setKey('Space', false)}
            onPointerLeave={() => setKey('Space', false)}
            aria-label={t('Wheelie')}
          >
            WHEELIE
          </button>
        ) : fighting ? (
          <>
            <button
              className="round-button round-button--duck"
              onPointerDown={(e) => {
                e.preventDefault()
                touchCrouch.on = true
              }}
              onPointerUp={() => {
                touchCrouch.on = false
              }}
              onPointerCancel={() => {
                touchCrouch.on = false
              }}
              onPointerLeave={() => {
                touchCrouch.on = false
              }}
              aria-label={t('Get down')}
            >
              DUCK
            </button>
            <button
              className="round-button round-button--fire"
              onPointerDown={(e) => {
                e.preventDefault()
                firePointer.held = true
                queueFire()
              }}
              onPointerUp={() => {
                firePointer.held = false
              }}
              onPointerCancel={() => {
                firePointer.held = false
              }}
              onPointerLeave={() => {
                firePointer.held = false
              }}
              aria-label={t('Shoot paint')}
            >
              FIRE
            </button>
          </>
        ) : sailing ? null : (
          <button
            className="round-button"
            onPointerDown={(e) => {
              e.preventDefault()
              if (mode === 'dialogue') dialogueBridge.advance()
              else queueInteract()
            }}
          >
            A
          </button>
        )}
      </div>
    </div>
  )
}
