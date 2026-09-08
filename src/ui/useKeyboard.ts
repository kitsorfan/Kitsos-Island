import { useEffect } from 'react'
import {
  ADVANCE_KEYS,
  CONFETTI_KEYS,
  FIRE_KEYS,
  INTERACT_KEYS,
  MOVE_KEYS,
  WATER_KEYS,
  clearKeys,
  dropHeld,
  firePointer,
  queueDrop,
  queueFire,
  queueInteract,
  queueJump,
  setKey,
} from '../game/input'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

/** Advance handler owned by the dialogue box, so typing can be skipped. */
export const dialogueBridge = { advance: () => useGame.getState().advance() }

const SCROLL_KEYS = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])

export function useKeyboard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      // Enter on a focused button would fire it as well as reaching the game.
      if (target?.tagName === 'BUTTON' && event.code === 'Enter') {
        event.preventDefault()
        target.blur()
      }

      const state = useGame.getState()
      const { mode } = state

      if (SCROLL_KEYS.has(event.code) && mode !== 'panel') event.preventDefault()
      if (event.code in MOVE_KEYS || event.code.startsWith('Shift')) {
        setKey(event.code, true)
      }
      if (event.repeat) return

      setKey(event.code, true)

      switch (mode) {
        case 'title':
          if (ADVANCE_KEYS.has(event.code)) state.start()
          else if (event.code === 'KeyC') {
            sfx.confirm()
            state.openGreeting()
          }
          return

        case 'dialogue':
          if (ADVANCE_KEYS.has(event.code)) dialogueBridge.advance()
          else if (event.code === 'Escape') state.closeDialogue()
          return

        case 'panel':
          if (event.code === 'Escape' || event.code === 'KeyX') {
            sfx.cancel()
            state.closePanel()
          }
          return

        case 'journal':
          if (['Escape', 'KeyJ', 'KeyX'].includes(event.code)) {
            sfx.cancel()
            state.closeJournal()
          }
          return

        case 'map':
          if (['Escape', 'KeyM', 'KeyX'].includes(event.code)) {
            sfx.cancel()
            state.closeMap()
          }
          return

        case 'greeting':
          if (['Escape', 'KeyC', 'KeyX'].includes(event.code)) {
            sfx.cancel()
            state.closeGreeting()
          }
          return

        case 'arcade':
          if (['Escape', 'KeyP', 'KeyX'].includes(event.code)) {
            state.closeArcade()
          }
          return

        case 'moto':
          if (ADVANCE_KEYS.has(event.code)) {
            if (state.moto?.status === 'briefing') state.beginMoto()
            else state.openMoto()
          } else if (event.code === 'Escape') {
            state.exitMoto()
          }
          return

        case 'balloon':
          if (ADVANCE_KEYS.has(event.code)) {
            if (state.balloon?.status === 'briefing') state.beginBalloon()
            else state.openBalloon()
          } else if (event.code === 'Escape') {
            state.exitBalloon()
          }
          return

        case 'paintball':
          if (ADVANCE_KEYS.has(event.code)) {
            if (state.paintball?.status === 'briefing') state.beginPaintball()
            else state.openPaintball()
          } else if (event.code === 'Escape') {
            state.exitPaintball()
          }
          return

        default:
          // Mid-match the trigger takes over the keys that normally hop
          // and interact, so nothing fires a dialogue during a firefight.
          if (state.paintball?.status === 'playing') {
            if (FIRE_KEYS.has(event.code)) queueFire()
            else if (event.code === 'Escape') state.exitPaintball()
            else if (event.code === 'KeyN') state.toggleMute()
            else if (event.code === 'KeyB') state.toggleMusic()
            else if (event.code === 'KeyL') state.toggleNight()
            else if (event.code === 'KeyT') state.toggleHandLight()
            else if (event.code === 'KeyM') state.openMap()
            return
          }

          // On the bike, the movement keys are the bike's; only quitting and
          // the map are still ours to read here.
          if (state.moto?.status === 'riding') {
            if (event.code === 'Escape') state.exitMoto()
            else if (event.code === 'KeyM') state.openMap()
            else if (event.code === 'KeyN') state.toggleMute()
            else if (event.code === 'KeyB') state.toggleMusic()
            else if (event.code === 'KeyL') state.toggleNight()
            else if (event.code === 'KeyT') state.toggleHandLight()
            return
          }

          // In the basket the stick, the burner and the two drop keys are
          // the flight's; only quitting and the map are still ours here.
          if (state.balloon?.status === 'flying') {
            if (WATER_KEYS.has(event.code)) queueDrop('water')
            else if (CONFETTI_KEYS.has(event.code)) queueDrop('confetti')
            else if (event.code === 'Escape') state.exitBalloon()
            else if (event.code === 'KeyM') state.openMap()
            else if (event.code === 'KeyN') state.toggleMute()
            else if (event.code === 'KeyB') state.toggleMusic()
            else if (event.code === 'KeyL') state.toggleNight()
            else if (event.code === 'KeyT') state.toggleHandLight()
            return
          }

          if (event.code === 'KeyP') state.openArcade()
          else if (event.code === 'Space') queueJump()
          else if (INTERACT_KEYS.has(event.code)) queueInteract()
          else if (event.code === 'KeyJ') {
            sfx.confirm()
            state.openJournal()
          } else if (event.code === 'KeyM') {
            sfx.confirm()
            state.openMap()
          } else if (event.code === 'KeyC') {
            sfx.confirm()
            state.openGreeting()
          } else if (event.code === 'KeyN') {
            state.toggleMute()
          } else if (event.code === 'KeyB') {
            state.toggleMusic()
          } else if (event.code === 'KeyL') {
            sfx.confirm()
            state.toggleNight()
          } else if (event.code === 'KeyT') {
            sfx.confirm()
            state.toggleHandLight()
          } else if (event.code === 'Escape' && state.area !== 'island') {
            sfx.cancel()
            state.leaveBuilding()
          }
      }
    }

    const onKeyUp = (event: KeyboardEvent) => setKey(event.code, false)
    const onBlur = () => {
      clearKeys()
      firePointer.held = false
      dropHeld.water = false
      dropHeld.confetti = false
    }

    // Clicking the world throws paint, but only while a match is on.
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      const target = event.target as HTMLElement | null
      if (target?.tagName !== 'CANVAS') return
      if (useGame.getState().paintball?.status !== 'playing') return
      firePointer.held = true
      queueFire()
    }
    const onPointerUp = () => {
      firePointer.held = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])
}
