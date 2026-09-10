import './index.css'
import { hasWebGL2 } from './game/webgl'
import { showUnsupported } from './ui/Unsupported'

const root = document.getElementById('root')!

// React and three.js are worth about 400 kB gzipped between them, and they
// are no use whatsoever to a visitor who cannot run WebGL. So the check comes
// first and the app is fetched only once it passes.
if (hasWebGL2()) {
  void (async () => {
    const [{ StrictMode, createElement }, { createRoot }, { default: App }] =
      await Promise.all([
        import('react'),
        import('react-dom/client'),
        import('./App.tsx'),
      ])

    createRoot(root).render(createElement(StrictMode, null, createElement(App)))
  })()
} else {
  showUnsupported(root)
}
