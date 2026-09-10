import { PROFILE } from '../data/profile'

/**
 * What a visitor sees when the island cannot be drawn for them.
 *
 * Written as plain DOM with its own styles rather than as a React component
 * on purpose: it has to render on a machine that has already shown it cannot
 * do the fancy thing, so it costs no framework, no stylesheet and no second
 * request. The CV itself is a real page at /cv.html, generated at build time
 * from the same data the island reads.
 */
export function showUnsupported(root: HTMLElement) {
  const style = document.createElement('style')
  style.textContent = `
.nowebgl {
  --ink: #1c2430; --soft: #5b6878; --line: #dfe5ec;
  --bg: #eaf4f8; --card: #ffffff; --accent: #1f6f8b;
  position: fixed; inset: 0; overflow: auto;
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
  background: var(--bg); color: var(--ink);
  font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
@media (prefers-color-scheme: dark) {
  .nowebgl {
    --ink: #e6ecf3; --soft: #9fb0c2; --line: #2b3644;
    --bg: #131a22; --card: #1b242e; --accent: #7ec8e3;
  }
}
.nowebgl__card {
  max-width: 34rem; width: 100%;
  background: var(--card); border: 1px solid var(--line);
  border-radius: 14px; padding: 2rem;
  box-shadow: 0 10px 40px rgb(0 0 0 / .08);
}
.nowebgl h1 { margin: 0 0 .5rem; font-size: 1.5rem; }
.nowebgl p { margin: 0 0 1rem; color: var(--soft); }
.nowebgl__actions { display: flex; flex-wrap: wrap; gap: .6rem; margin: 1.5rem 0 0; }
.nowebgl__btn {
  display: inline-block; padding: .65rem 1.2rem; border-radius: 8px;
  text-decoration: none; font-weight: 600; border: 1px solid var(--line);
  color: var(--ink);
}
.nowebgl__btn--primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.nowebgl__why { margin: 1.5rem 0 0; padding-top: 1rem; border-top: 1px solid var(--line); font-size: .9rem; }
.nowebgl__why summary { cursor: pointer; color: var(--soft); }
.nowebgl__why ul { margin: .6rem 0 0; padding-left: 1.2rem; color: var(--soft); }
`

  const card = document.createElement('div')
  card.className = 'nowebgl'
  card.innerHTML = `
<div class="nowebgl__card">
  <h1>The island needs 3D graphics</h1>
  <p>
    This CV is normally an explorable 3D island, but your browser cannot run
    WebGL 2 — usually because hardware acceleration is turned off, or the page
    is open in a remote desktop session.
  </p>
  <p><strong>The whole CV is available as a plain page instead.</strong></p>
  <div class="nowebgl__actions">
    <a class="nowebgl__btn nowebgl__btn--primary" href="/cv.html">Read the CV</a>
    <a class="nowebgl__btn" href="mailto:${PROFILE.email}">Email me</a>
    <a class="nowebgl__btn" href="${PROFILE.linkedin}" rel="noopener">LinkedIn</a>
  </div>
  <details class="nowebgl__why">
    <summary>How to see the island anyway</summary>
    <ul>
      <li>Chrome or Edge: Settings → System → turn on “Use graphics acceleration when available”, then restart the browser.</li>
      <li>Firefox: open <code>about:config</code> and set <code>webgl.disabled</code> to <code>false</code>.</li>
      <li>Open the page on a normal desktop session rather than remote desktop.</li>
    </ul>
  </details>
</div>
`

  document.head.appendChild(style)
  root.replaceChildren(card)
}
