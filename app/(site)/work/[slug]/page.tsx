import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import Icon from '@/components/Icon';
import ProjectCard from '@/components/ProjectCard';
import SectionIntro from '@/components/SectionIntro';
import { displayDomain, galleryImages, lines, paragraphs, type GalleryImage } from '@/lib/case-study';
import { projectBySlug, relatedProjects, safeAllProjects } from '@/lib/portfolio';
import { getService, services, serviceStyle } from '@/lib/services';

type Props = { params: Promise<{ slug: string }> };

const loadProject = cache(async (slug: string) => projectBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug).catch(() => null);
  if (!project) return { title: 'Project not found' };
  const description = project.intro || project.summary || `A ${project.client ?? ''} project by Squaberry.`;
  return {
    title: `${project.title} case study`,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title}: ${project.summary ?? 'case study'}`,
      description,
      images: project.image_url ? [{ url: project.image_url }] : undefined,
    },
  };
}

function Shot({ image, sizes, priority = false }: { image: GalleryImage; sizes: string; priority?: boolean }) {
  return (
    <figure className="case-shot reveal">
      {image.src.startsWith('/') ? (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
      ) : (
        <img src={image.src} alt={image.alt} loading="lazy" />
      )}
    </figure>
  );
}

function Story({ title, text, id }: { title: string; text: string | null; id: string }) {
  const parts = paragraphs(text);
  if (!parts.length) return null;
  return (
    <section className="case-text" aria-labelledby={id}>
      <h2 id={id} className="case-heading reveal">{title}</h2>
      {parts.map(part => <p className="reveal" key={part.slice(0, 40)}>{part}</p>)}
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();

  const service = getService(project.service_slug);
  const scope = lines(project.scope);
  const overview = paragraphs(project.overview);
  const challenge = paragraphs(project.challenge);
  const gallery = galleryImages(project.gallery);
  const [wide, tall, side, ...more] = gallery;
  const domain = displayDomain(project.site_url);
  const related = relatedProjects(await safeAllProjects(), project);
  const helpers = services.filter(item => item.slug !== project.service_slug);
  const helpColumns = service ? [service, ...helpers] : helpers;

  return (
    <main id="main" className="case">
      <section className="container case-hero" aria-labelledby="pageTitle">
        <nav className="case-crumbs rise" aria-label="Breadcrumb">
          <Link href="/work">Projects</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>
        <div className="case-hero-grid">
          <h1 id="pageTitle" className="display-l rise d1">{project.summary || project.title}</h1>
          <div className="case-hero-side rise d2">
            {project.intro && <p>{project.intro}</p>}
            {project.site_url && (
              <a className="text-link" href={project.site_url} target="_blank" rel="noopener noreferrer">
                Visit {domain} <Icon name="arrow-up-right" size={18} /><span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {project.image_url && (
        <div className="container case-cover rise d3">
          <div className="case-cover-frame">
            <div className="case-cover-media">
              {project.image_url.startsWith('/') ? (
                <Image src={project.image_url} alt={`${project.title} project artwork`} fill sizes="(max-width: 1400px) 100vw, 1320px" priority />
              ) : (
                <img src={project.image_url} alt={`${project.title} project artwork`} />
              )}
            </div>
            <ul className="case-cover-tags tag-row" aria-label="Project tags">
              {project.client && <li className="tag">{project.client}</li>}
              {service && <li className="tag">{service.name}</li>}
            </ul>
          </div>
        </div>
      )}

      <section className="panel panel-cream case-panel" aria-label="Case study">
        <div className="container case-body">
          <aside className="case-facts reveal" aria-label="Project facts">
            <dl>
              {project.client && (
                <div><dt>Industry</dt><dd>{project.client}</dd></div>
              )}
              {service && (
                <div><dt>Service</dt><dd><Link href={`/services/${service.slug}`}>{service.name}</Link></dd></div>
              )}
              {scope.length > 0 && (
                <div><dt>What we did</dt><dd><ul>{scope.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
              )}
              {project.site_url && (
                <div><dt>Website</dt><dd><a href={project.site_url} target="_blank" rel="noopener noreferrer">{domain}<span className="visually-hidden"> (opens in a new tab)</span></a></dd></div>
              )}
            </dl>
          </aside>

          <div className="case-story">
            {overview.length > 0 && (
              <section aria-label="Overview">
                <p className="case-lead reveal">{overview[0]}</p>
                {overview.slice(1).map(part => <p className="reveal" key={part.slice(0, 40)}>{part}</p>)}
              </section>
            )}
            {challenge.length > 0 && <Story title="The challenge" text={project.challenge} id="challengeTitle" />}
          </div>
        </div>

        {wide && (
          <div className="container case-gallery is-wide">
            <Shot image={wide} sizes="(max-width: 1400px) 100vw, 1320px" />
          </div>
        )}

        <div className="container case-narrow">
          <Story title="What we built" text={project.solution} id="solutionTitle" />
        </div>

        {(tall || side) && (
          <div className={`container case-gallery is-pair${tall && side ? '' : ' is-single'}`}>
            {tall && <Shot image={tall} sizes="(max-width: 640px) 100vw, 40vw" />}
            {side && <Shot image={side} sizes="(max-width: 640px) 100vw, 60vw" />}
          </div>
        )}

        {project.quote && (
          <div className="container case-narrow">
            <figure className="case-quote reveal">
              <blockquote><p>{project.quote}</p></blockquote>
              {project.quote_name && (
                <figcaption><strong>{project.quote_name}</strong>{project.quote_role && <span>{project.quote_role}</span>}</figcaption>
              )}
            </figure>
          </div>
        )}

        <div className="container case-narrow">
          <Story title="The outcome" text={project.results} id="resultsTitle" />
        </div>

        {more.map(image => (
          <div className="container case-gallery is-wide" key={image.src}>
            <Shot image={image} sizes="(max-width: 1400px) 100vw, 1320px" />
          </div>
        ))}
      </section>

      <section className="container section" aria-labelledby="helpTitle">
        <SectionIntro label="How we can help" title="Planning something similar?" id="helpTitle">
          <p>{service ? `This project was led by our ${service.name.toLowerCase()} team. ` : ''}Here’s everything we can bring to yours.</p>
        </SectionIntro>
        <ul className="case-help">
          {helpColumns.map(item => (
            <li key={item.slug} className="reveal" style={{ ['--accent' as string]: serviceStyle[item.slug]?.accent }}>
              <Link href={`/services/${item.slug}`} className="case-help-title">
                <span className="case-help-icon"><Icon name={serviceStyle[item.slug]?.icon ?? 'web'} size={22} /></span>
                {item.name}
              </Link>
              <ul>
                {item.deliverables.slice(0, 5).map(deliverable => <li key={deliverable.title}>{deliverable.title}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-tight" aria-labelledby="ctaTitle">
        <div className="panel panel-lav cta-panel reveal">
          <h2 id="ctaTitle" className="display-l">Have something similar in mind?</h2>
          <div className="cta-side">
            <p>Tell us about your project. Three quick steps and we’ll reply by email, or write to <a className="text-link" href="mailto:hello@squaberry.co.uk">hello@squaberry.co.uk</a>.</p>
            <Link className="btn is-dark is-lg" href="/contact#enquiry"><span>Start a project</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container section" aria-labelledby="relatedTitle">
          <SectionIntro label="More work" title="Keep exploring" id="relatedTitle" />
          <div className="bento case-related">
            {related.map(item => <ProjectCard key={item.id} project={item} className="span-4" />)}
          </div>
          <p className="case-all"><Link className="text-link" href="/work">See all projects <Icon name="arrow-right" size={18} /></Link></p>
        </section>
      )}

      {project.site_url && (
        <div className="case-float">
          <a className="btn" href={project.site_url} target="_blank" rel="noopener noreferrer">
            <span>Visit the live site</span>
            <span className="btn-icon"><Icon name="arrow-up-right" size={18} /></span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      )}
    </main>
  );
}
