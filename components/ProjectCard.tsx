import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import { projectHref, type CardProject } from '@/lib/case-study';
import { getService, serviceStyle } from '@/lib/services';

type Props = {
  project: CardProject;
  className?: string;
  priority?: boolean;
  /** Wide layout: image beside the text on large screens (home page feature). */
  featured?: boolean;
};

/** Framed project card: image inset in a soft frame, name and headline below, tags and arrow along the bottom. */
export default function ProjectCard({ project, className = '', priority = false, featured = false }: Props) {
  const service = getService(project.service_slug);
  const target = projectHref(project);
  const sizes = featured ? '(max-width: 960px) 100vw, 60vw' : '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 45vw';
  const content = (
    <>
      <div className="project-media">
        {project.image_url?.startsWith('/') ? (
          <Image src={project.image_url} alt={`${project.title} project artwork`} fill sizes={sizes} priority={priority} />
        ) : project.image_url ? (
          <img src={project.image_url} alt={`${project.title} project artwork`} loading="lazy" />
        ) : null}
      </div>
      <div className="project-meta">
        <div className="project-text">
          <p className="project-name">{project.title}</p>
          <h3>{project.summary || project.title}</h3>
        </div>
        <div className="project-foot">
          <ul className="tag-row" aria-label="Project details">
            {project.client && <li className="tag">{project.client}</li>}
            {service && (
              <li className="tag is-service" style={{ ['--accent' as string]: serviceStyle[service.slug]?.accent }}>{service.name}</li>
            )}
          </ul>
          {target && (
            <span className="project-go" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span>
          )}
        </div>
      </div>
    </>
  );

  const label = `${project.title}: ${project.summary ?? ''}`;
  const classes = `project-card${featured ? ' is-featured' : ''} tilt-in ${className}`;
  return (
    <article className={classes}>
      {target?.external ? (
        <a href={target.href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens the live site in a new tab)`}>
          {content}
        </a>
      ) : target ? (
        <Link href={target.href} aria-label={`${label}. View the project`}>
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </article>
  );
}
