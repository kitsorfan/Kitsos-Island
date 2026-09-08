import { MINIGAMES } from '../data/minigames'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

/** What the board in the plaza opens: the island's games, and their rules. */
export function ArcadeCard() {
  const close = useGame((s) => s.closeArcade)
  const openPaintball = useGame((s) => s.openPaintball)
  const openMoto = useGame((s) => s.openMoto)
  const openBalloon = useGame((s) => s.openBalloon)

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
          Three things happen on this island when the working day is done.
          Pick one — the plaza is where all of them start.
        </p>

        <div className="arcade__grid">
          {MINIGAMES.map((game) => (
            <article
              key={game.id}
              className="game-card"
              style={{ '--accent': game.accent } as React.CSSProperties}
            >
              <span className="game-card__emoji" aria-hidden>
                {game.emoji}
              </span>
              <span className="game-card__kicker">{game.kicker}</span>
              <h3>{game.title}</h3>
              <p>{game.blurb}</p>
              <ul>
                {game.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <button
                className="button button--primary"
                onClick={() => {
                  sfx.confirm()
                  if (game.id === 'paintball') openPaintball()
                  else if (game.id === 'moto') openMoto()
                  else openBalloon()
                }}
              >
                Play {game.title}
              </button>
            </article>
          ))}
        </div>

        <p className="arcade__note">
          All three are played on the island itself — the same island, the
          same people, the same plaza. Leave whenever you like with Esc.
        </p>
      </div>
    </div>
  )
}
