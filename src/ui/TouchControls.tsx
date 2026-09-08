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
} from '../game/input'
import { useGame } from '../state/store'
import { dialogueBridge } from './useKeyboard'
import { useCoarsePointer } from './useCoarsePointer'
import * as sfx from '../game/audio'

const RADIUS = 52

export function TouchControls() {
  const coarse = useCoarsePointer()
  const mode = useGame((s) => s.mode)
  const fighting = useGame((s) => s.paintball?.status === 'playing')
  const riding = useGame((s) => s.moto?.status === 'riding')
  const flying = useGame((s) => s.balloon?.status === 'flying')
  const openJournal = useGame((s) => s.openJournal)
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)

  useEffect(() => () => {
    touchStick.active = false
    touchStick.x = 0
    touchStick.y = 0
    touchCrouch.on = false
    firePointer.held = false
    dropHeld.water = false
    dropHeld.confetti = false
  }, [])

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
    <div className="touch">
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
        {mode === 'explore' && !fighting && !riding && !flying && (
          <>
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
            <button
              className="round-button round-button--jump"
              onPointerDown={(e) => {
                e.preventDefault()
                queueJump()
              }}
              aria-label="Jump"
            >
              ⤒
            </button>
          </>
        )}

        {flying ? (
          <>
            {/* The burner is the only altitude control on a touch screen —
                let go of it and the balloon sinks back down on its own. */}
            <button
              className="round-button round-button--burn"
              onPointerDown={(e) => {
                e.preventDefault()
                setKey('ShiftLeft', true)
              }}
              onPointerUp={() => setKey('ShiftLeft', false)}
              onPointerCancel={() => setKey('ShiftLeft', false)}
              onPointerLeave={() => setKey('ShiftLeft', false)}
              aria-label="Burner"
            >
              BURN
            </button>
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
              aria-label="Drop a water bomb"
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
              aria-label="Throw confetti"
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
            aria-label="Wheelie"
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
              aria-label="Get down"
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
              aria-label="Shoot paint"
            >
              FIRE
            </button>
          </>
        ) : (
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
