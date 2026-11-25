import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import { projectHref, type CardProject } from '@/lib/case-study';
import { getService } from '@/lib/services';

type Props = { project: CardProject; className?: string; priority?: boolean; headingLevel?: 'h2' | 'h3' };

/** Rounded project cover: full-bleed image, tags and headline over a soft top scrim. Opens the project page. */
export default function ProjectCard({ project, className = '', priority = false, headingLevel: Heading = 'h3' }: Props) {
  const service = getService(project.service_slug);
  const tags = [project.title, project.client].filter(Boolean) as string[];
  const target = projectHref(project);
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
        <Heading>{project.summary || project.title}</Heading>
      </div>
      {target && (
        <span className="project-go" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span>
      )}
    </>
  );

  const label = `${project.title}: ${project.summary ?? ''}`;
  return (
    <article className={`project-card tilt-in ${className}`}>
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
