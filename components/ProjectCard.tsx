import Image from 'next/image';
import Icon from './Icon';
import type { PortfolioItem } from '@/lib/data';
import { getService } from '@/lib/services';

type Props = { project: PortfolioItem; className?: string; priority?: boolean };

/** Rounded project cover: full-bleed image, tags and headline over a soft top scrim. */
export default function ProjectCard({ project, className = '', priority = false }: Props) {
  const service = getService(project.service_slug);
  const tags = [project.title, project.client].filter(Boolean) as string[];
  const content = (
    <>
      <div className="project-media">
        {project.image_url?.startsWith('/') ? (
          <Image src={project.image_url} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 60vw" priority={priority} />
        ) : project.image_url ? (
          <img src={project.image_url} alt="" loading="lazy" />
        ) : null}
      </div>
      <div className="project-meta">
        <ul className="tag-row" aria-label="Project details">
          {tags.map(tag => <li className="tag" key={tag}>{tag}</li>)}
          {service && <li className="tag is-ghost">{service.name}</li>}
        </ul>
        <h3>{project.summary || project.title}</h3>
      </div>
      {project.site_url && (
        <span className="project-go" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span>
      )}
    </>
  );

  return (
    <article className={`project-card tilt-in ${className}`}>
      {project.site_url ? (
        <a href={project.site_url} target="_blank" rel="noopener noreferrer" aria-label={`${project.title}: ${project.summary ?? ''} (opens the live site in a new tab)`}>
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </article>
  );
}
