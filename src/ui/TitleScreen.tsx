import { PROFILE } from '../data/profile'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

export function TitleScreen() {
  const start = useGame((s) => s.start)
  const openGreeting = useGame((s) => s.openGreeting)

  const begin = () => {
    sfx.jingle()
    start()
  }

  return (
    <div className="title">
      <div className="title__card">
        <p className="title__kicker">A playable CV</p>
        <h1 className="title__logo">
          <span>KITSOS</span>
          <span>ISLAND</span>
        </h1>
        <p className="title__name">
          {PROFILE.firstName} “{PROFILE.nickname}” {PROFILE.lastName}
        </p>
        <p className="title__role">
          {PROFILE.title} · {PROFILE.location}
        </p>

        <p className="title__blurb">
          Walk the island, talk to the townspeople and step inside the buildings.
          Five keys are hidden across the districts, one per building — find them
          all and the Old Lighthouse on the cape opens. The Radio Center down
          south sends a message straight to my inbox.
        </p>

        <button className="button button--start" onClick={begin}>
          ▶ Start exploring
        </button>

        <button
          className="title__skip"
          onClick={() => {
            sfx.confirm()
            openGreeting()
          }}
        >
          In a hurry? Get the full CV and my contact details →
        </button>

        <ul className="title__keys">
          <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move</li>
          <li><kbd>Shift</kbd> sprint</li>
          <li><kbd>E</kbd> interact</li>
          <li><kbd>Space</kbd> jump</li>
          <li><kbd>Q</kbd><kbd>R</kbd> turn camera</li>
          <li><kbd>M</kbd> map &amp; travel</li>
          <li><kbd>J</kbd> journal</li>
        </ul>
        <p className="title__touch">On a phone? Use the stick and the A button.</p>
      </div>
    </div>
  )
}
