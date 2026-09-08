import { useEffect, useRef } from 'react'
import { BUILDINGS } from '../data/world'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { RadioConsole } from './RadioConsole'
import type { PanelBlock } from '../types'

export function Panel() {
  const panelId = useGame((s) => s.panelId)
  const closePanel = useGame((s) => s.closePanel)
  const body = useRef<HTMLDivElement>(null)
  const building = BUILDINGS.find((b) => b.id === panelId)

  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [panelId])

  if (!building) return null

  const close = () => {
    sfx.cancel()
    closePanel()
  }

  return (
    <div className="overlay" onPointerDown={close}>
      <section
        className="panel"
        style={{ '--accent': building.accent } as React.CSSProperties}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={building.name}
      >
        <header className="panel__head">
          <div>
            <p className="panel__kicker">{building.panel.kicker}</p>
            <h2 className="panel__title">{building.panel.title}</h2>
          </div>
          <button className="panel__close" onClick={close} aria-label="Close">
            ✕<kbd>Esc</kbd>
          </button>
        </header>

        <div className="panel__body" ref={body}>
          {building.panel.sections.map((section) => (
            <section key={section.heading} className="panel__section">
              <h3 className="panel__heading">{section.heading}</h3>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
          {building.kind === 'radio' && <RadioConsole />}
        </div>
      </section>
    </div>
  )
}

function Block({ block }: { block: PanelBlock }) {
  switch (block.type) {
    case 'text':
      return <p className="panel__text">{block.text}</p>

    case 'quote':
      return <blockquote className="panel__quote">{block.text}</blockquote>

    case 'list':
      return (
        <ul className="panel__list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )

    case 'stats':
      return (
        <div className="stat-grid">
          {block.stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat__label">{s.label}</span>
              <span className="stat__value">{s.value}</span>
            </div>
          ))}
        </div>
      )

    case 'tags':
      return (
        <div className="tag-groups">
          {block.groups.map((group) => (
            <div key={group.label} className="tag-group">
              <span className="tag-group__label">{group.label}</span>
              <div className="tag-group__tags">
                {group.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )

    case 'timeline':
      return (
        <ol className="timeline">
          {block.entries.map((entry, i) => (
            <li key={i} className="timeline__item">
              <span className="timeline__dot" aria-hidden />
              <div className="timeline__head">
                <h4>{entry.title}</h4>
                {entry.org && <p className="timeline__org">{entry.org}</p>}
                <p className="timeline__meta">{entry.meta}</p>
              </div>
              {entry.bullets && (
                <ul className="panel__list">
                  {entry.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {entry.tags && (
                <div className="tag-group__tags">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="chip chip--sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )
  }
}
