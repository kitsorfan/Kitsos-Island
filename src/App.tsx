import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './world/Scene'
import { DialogueBox } from './ui/DialogueBox'
import { Greeting } from './ui/Greeting'
import { Hud } from './ui/Hud'
import { Journal } from './ui/Journal'
import { MapOverlay } from './ui/MapOverlay'
import { ArcadeCard } from './ui/ArcadeCard'
import { BalloonCard } from './ui/BalloonCard'
import { MotoCard } from './ui/MotoCard'
import { PaintballCard } from './ui/PaintballCard'
import { Panel } from './ui/Panel'
import { TitleScreen } from './ui/TitleScreen'
import { Toast } from './ui/Toast'
import { TouchControls } from './ui/TouchControls'
import { useKeyboard } from './ui/useKeyboard'
import { useGame } from './state/store'
import { setMuted } from './game/audio'
import { setMood, setMusicEnabled } from './game/music'

/** Covers the canvas while a new area builds its scene graph. */
function Curtain() {
  const token = useGame((s) => s.spawn.token)
  if (token === 0) return null
  return <div key={token} className="curtain" aria-hidden />
}

export default function App() {
  const mode = useGame((s) => s.mode)
  const area = useGame((s) => s.area)
  const greetingReturn = useGame((s) => s.greetingReturn)
  const muted = useGame((s) => s.muted)
  const musicOn = useGame((s) => s.musicOn)
  const night = useGame((s) => s.night)
  const party = useGame((s) => s.party)
  useKeyboard()

  useEffect(() => {
    setMuted(muted)
  }, [muted])

  // Browsers will not start audio before a gesture, so the soundtrack waits
  // for the first click or key press and then follows the toggles.
  useEffect(() => {
    const wanted = musicOn && !muted
    if (!wanted) {
      setMusicEnabled(false)
      return
    }

    const begin = () => setMusicEnabled(true)
    begin()
    window.addEventListener('pointerdown', begin)
    window.addEventListener('keydown', begin)
    return () => {
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
    }
  }, [musicOn, muted])

  useEffect(() => {
    setMood(
      area === 'island'
        ? party
          ? 'party'
          : night
            ? 'night'
            : 'island'
        : area === 'lighthouse'
          ? 'lighthouse'
          : 'indoor',
    )
  }, [area, night, party])

  return (
    <div className="app">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 40, near: 2, far: 2200, position: [0, 60, 60] }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <Curtain />

      {mode === 'title' || (mode === 'greeting' && greetingReturn === 'title') ? (
        <TitleScreen />
      ) : (
        <>
          <Hud />
          {mode === 'dialogue' && <DialogueBox />}
          {mode === 'panel' && <Panel />}
          {mode === 'journal' && <Journal />}
          {mode === 'map' && <MapOverlay />}
          {mode === 'paintball' && <PaintballCard />}
          {mode === 'arcade' && <ArcadeCard />}
          {mode === 'moto' && <MotoCard />}
          {mode === 'balloon' && <BalloonCard />}
          <TouchControls />
          <Toast />
        </>
      )}

      {mode === 'greeting' && <Greeting />}
    </div>
  )
}
