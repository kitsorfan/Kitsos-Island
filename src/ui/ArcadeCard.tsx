import { MINIGAMES } from '../data/minigames'
import type { MinigameEntry } from '../data/minigames'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

/**
 * What the board in the plaza opens: the island's games, a line apiece.
 *
 * This is where the games are explained: what each one is, and the three
 * things worth knowing before you pick it. It is laid out tight — five games
 * in two columns — because the version with a card apiece was taller than the
 * window it opens in.
 */
export function ArcadeCard() {
  const close = useGame((s) => s.closeArcade)
  const night = useGame((s) => s.night)
  const lighthouseOpen = useGame((s) => s.lighthouseOpen)
  const openPaintball = useGame((s) => s.openPaintball)
  const openMoto = useGame((s) => s.openMoto)
  const openBalloon = useGame((s) => s.openBalloon)
  const openHide = useGame((s) => s.openHide)
  const openRescue = useGame((s) => s.openRescue)

  const start = (id: MinigameEntry['id']) => {
    sfx.confirm()
    if (id === 'paintball') openPaintball()
    else if (id === 'moto') openMoto()
    else if (id === 'balloon') openBalloon()
    else if (id === 'rescue') openRescue()
    else openHide()
  }

  /** Why this one cannot be started right now, if it cannot. */
  const shut = (game: MinigameEntry): string | null => {
    if (game.needs === 'lighthouse' && !lighthouseOpen) {
      return 'Behind five locks. Find every district key first.'
    }
    if (game.when === 'night' && !night) return 'After dark only — press L.'
    if (game.when === 'day' && night) return 'Daylight only — press L.'
    return null
  }

  return (
    <div className="overlay">
      <div className="arcade">
        <div className="arcade__head">
          <div>
            <span className="arcade__kicker">Games board · Town Plaza</span>
            <h2 className="arcade__title">Island Games</h2>
          </div>
          <button
            className="panel__close"
            onClick={() => close()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="arcade__lead">
          Four in daylight, one after the lamps go out. Leave any of them with
          Esc.
        </p>

        <div className="arcade__grid">
          {MINIGAMES.map((game) => {
            const locked = shut(game)
            const accent = { '--accent': game.accent } as React.CSSProperties
            const inside = (
              <>
                <span className="game-row__head">
                  <span className="game-row__emoji" aria-hidden>
                    {game.emoji}
                  </span>
                  <strong className="game-row__name">{game.title}</strong>
                </span>
                <span className="game-row__blurb">{game.blurb}</span>
                {locked ? (
                  <span className="game-row__shut">{locked}</span>
                ) : (
                  <ul className="game-row__rules">
                    {game.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                )}
              </>
            )

            // The whole row is the button when it can be played; a locked one
            // is not a button at all, so the keyboard skips straight past it.
            return locked ? (
              <div
                key={game.id}
                className="game-row game-row--shut"
                style={accent}
              >
                {inside}
              </div>
            ) : (
              <button
                key={game.id}
                className="game-row"
                style={accent}
                onClick={() => start(game.id)}
              >
                {inside}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
