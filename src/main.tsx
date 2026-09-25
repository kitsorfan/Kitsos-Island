import './index.css'
import { hasWebGL2 } from './shared/engine/webgl'
import { showUnsupported } from './shared/ui/Unsupported'

const root = document.getElementById('root')!

// A certificate being checked is not the island: the verifier is a page of
// its own, fetched on its own, and needs neither WebGL nor React. The host
// serves index.html for any path it has no file for, which is what lets
// /verify/<reference> arrive here at all.
if (/^\/verify(\/|$)/.test(location.pathname)) {
  void import('./features/verify/VerifyPage').then(({ showVerify }) =>
    showVerify(root),
  )
}
// React and three.js are worth about 400 kB gzipped between them, and they
// are no use whatsoever to a visitor who cannot run WebGL. So the check comes
// first and the app is fetched only once it passes.
else if (hasWebGL2()) {
  void (async () => {
    /*
     * A visitor who chose Greek last time gets it fetched alongside the app
     * rather than after it. The island would render in English and correct
     * itself a moment later without this, which reads as a flicker on the
     * one screen where it is least wanted — the first.
     *
     * Read straight from storage: the store lives inside the app chunk, and
     * waiting for it would put this request behind the very download it is
     * meant to run beside. A stored value that is anything other than Greek,
     * or no storage at all, costs nothing here.
     */
    let greek: Promise<unknown> = Promise.resolve()
    try {
      if (localStorage.getItem('island.settings')?.includes('"locale":"el"')) {
        greek = import('./shared/i18n/el/index')
      }
    } catch {
      /* No storage to read; English it is. */
    }

    const [{ StrictMode, createElement }, { createRoot }, { default: App }] =
      await Promise.all([
        import('react'),
        import('react-dom/client'),
        import('./App.tsx'),
        greek,
      ])

    createRoot(root).render(createElement(StrictMode, null, createElement(App)))
  })()
} else {
  showUnsupported(root)
}
