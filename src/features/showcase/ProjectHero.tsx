import { useState } from 'react'
import { PROJECT_BY_ID } from './projects'
import { useT } from '../../shared/i18n/useT'

/**
 * The top of a project's card: the screenshot and the ways out to the real
 * thing, before a word of description.
 *
 * Everything here leaves the island in a new tab, so the walk is still where
 * it was when they come back. The screenshot is a link too, to the same place
 * as the main button, because it is the thing people click.
 */
export function ProjectHero({ id }: { id?: string }) {
  const t = useT()
  const project = t(id ? PROJECT_BY_ID.get(id) : undefined)
  const [missing, setMissing] = useState(false)
  if (!project) return null

  const main = project.links.find((link) => link.primary) ?? project.links[0]
  const newTab = t('opens in a new tab')

  return (
    <div className="project">
      {!missing && (
        <figure className="project__figure">
          <a
            className="project__shot"
            href={main.href}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={`${import.meta.env.BASE_URL}projects/${project.image}`}
              alt={project.alt}
              width={1280}
              height={720}
              onError={() => setMissing(true)}
            />
          </a>
          {project.credit && (
            <figcaption className="project__credit">
              {project.credit}
            </figcaption>
          )}
        </figure>
      )}

      <div className="project__links">
        {project.links.map((link) => (
          <a
            key={link.href}
            className={`button project__link${link.primary ? ' button--primary' : ''}`}
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.label}
            <span aria-hidden>↗</span>
            <span className="project__new-tab">({newTab})</span>
          </a>
        ))}
      </div>
    </div>
  )
}
