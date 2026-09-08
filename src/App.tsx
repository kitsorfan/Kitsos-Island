import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './world/Scene'
import { DialogueBox } from './ui/DialogueBox'
import { Hud } from './ui/Hud'
import { Journal } from './ui/Journal'
import { Panel } from './ui/Panel'
import { TitleScreen } from './ui/TitleScreen'
import { Toast } from './ui/Toast'
import { TouchControls } from './ui/TouchControls'
import { useKeyboard } from './ui/useKeyboard'
import { useGame } from './state/store'
import { setMuted } from './game/audio'

export default function App() {
  const mode = useGame((s) => s.mode)
  const muted = useGame((s) => s.muted)
  useKeyboard()

  useEffect(() => {
    setMuted(muted)
  }, [muted])

  return (
    <div className="app">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 40, near: 0.5, far: 1200, position: [0, 46, 44] }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {mode === 'title' ? (
        <TitleScreen />
      ) : (
        <>
          <Hud />
          {mode === 'dialogue' && <DialogueBox />}
          {mode === 'panel' && <Panel />}
          {mode === 'journal' && <Journal />}
          <TouchControls />
          <Toast />
        </>
      )}
    </div>
  )
}
