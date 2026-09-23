import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveQuality } from './shared/engine/AdaptiveQuality'
import { Scene } from './shared/engine/Scene'
import { DialogueBox } from './shared/ui/DialogueBox'
import { Greeting } from './shared/ui/Greeting'
import { Hud } from './shared/ui/Hud'
import { Journal } from './features/cv/Journal'
import { MapOverlay } from './features/map/MapOverlay'
import { ArcadeCard } from './features/arcade/ArcadeCard'
import { CalendarCard } from './features/calendar/CalendarCard'
import { FeastCheer } from './features/party/FeastCheer'
import { LectureHud } from './features/lecture/LectureHud'
import { LiftPanel } from './features/lift/LiftPanel'
import { LiftRide } from './features/lift/LiftRide'
import { LaunchSequence } from './features/launch/LaunchSequence'
import { OrbitCard } from './features/launch/OrbitCard'
import { BalloonCard } from './features/balloon/BalloonCard'
import { HideCard } from './features/hide/HideCard'
import { MotoCard } from './features/moto/MotoCard'
import { RescueCard } from './features/rescue/RescueCard'
import { PaintballCard } from './features/paintball/PaintballCard'
import { Panel } from './shared/ui/Panel'
import { TitleScreen } from './shared/ui/TitleScreen'
import { Toast } from './shared/ui/Toast'
import { TouchControls } from './features/player/TouchControls'
import { useKeyboard } from './features/player/useKeyboard'
import { useGame } from './shared/state/store'
import { setMuted, setSfxLevel } from './shared/engine/audio'
import type { Mood } from './features/radio/music'
import { setMood, setMusicEnabled, setMusicLevel } from './features/radio/music'
import { FEAST_AREA } from './features/party/feast'

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
  const musicLevel = useGame((s) => s.musicLevel)
  const sfxLevel = useGame((s) => s.sfxLevel)
  const night = useGame((s) => s.night)
  const party = useGame((s) => s.party)
  const christmas = useGame((s) => s.christmas)
  const paintball = useGame((s) => s.paintball?.status)
  const moto = useGame((s) => s.moto?.status)
  const balloon = useGame((s) => s.balloon?.status)
  const hide = useGame((s) => s.hide?.status)
  const rescue = useGame((s) => s.rescue?.status)
  const launch = useGame((s) => s.launch)
  useKeyboard()

  useEffect(() => {
    setMuted(muted)
  }, [muted])

  // Levels restored from a previous visit have to reach the audio graph,
  // which starts every session at full.
  useEffect(() => {
    setSfxLevel(sfxLevel)
  }, [sfxLevel])

  useEffect(() => {
    setMusicLevel(musicLevel)
  }, [musicLevel])

  // Browsers will not start audio before a gesture, so the soundtrack waits
  // for the first click or key press and then follows the toggles.
  useEffect(() => {
    const wanted = musicOn && !muted && musicLevel > 0
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
  }, [musicOn, muted, musicLevel])

  // A round in progress owns the soundtrack — each game has its own piece —
  // and the island only gets it back once the results are in.
  useEffect(() => {
    const playing: Mood | null =
      paintball === 'briefing' || paintball === 'playing'
        ? 'paintball'
        : moto && moto !== 'done'
          ? 'moto'
          : balloon && balloon !== 'done'
            ? 'balloon'
            : hide && hide !== 'done'
              ? 'hide'
              : rescue && rescue !== 'done'
                ? 'boat'
                : null

    setMood(
      /* A launch outranks every other piece: the island's tune has no
         business playing over a rocket, and orbit has one of its own. */
      launch
        ? 'orbit'
        : (playing ??
            (area === 'island'
              ? party
                ? 'party'
                : night
                  ? 'night'
                  : 'island'
              : area === 'lighthouse'
                ? 'lighthouse'
                : // The one room on the island with a date attached to it.
                  area === FEAST_AREA && christmas
                  ? 'christmas'
                  : 'indoor')),
    )
  }, [
    area,
    night,
    party,
    christmas,
    paintball,
    moto,
    balloon,
    hide,
    rescue,
    launch,
  ])

  return (
    <div className="app">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 40, near: 2, far: 2200, position: [0, 60, 60] }}
      >
        <AdaptiveQuality />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <Curtain />

      {mode === 'title' ||
      (mode === 'greeting' && greetingReturn === 'title') ? (
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
          {mode === 'calendar' && <CalendarCard />}
          {mode === 'moto' && <MotoCard />}
          {mode === 'balloon' && <BalloonCard />}
          {mode === 'hide' && <HideCard />}
          {mode === 'rescue' && <RescueCard />}
          <TouchControls />
          <FeastCheer />
          <LectureHud />
          <LiftPanel />
          <LiftRide />
          <LaunchSequence />
          <OrbitCard />
          <Toast />
        </>
      )}

      {mode === 'greeting' && <Greeting />}
    </div>
  )
}
