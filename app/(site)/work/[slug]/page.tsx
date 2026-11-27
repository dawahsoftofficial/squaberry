import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { absoluteUrl, clip, pageMetadata } from '@/lib/seo';
import { mediaUrl } from '@/lib/media-url';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import CaseNav from '@/components/CaseNav';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbSchema, caseStudySchema } from '@/lib/schema';
import ProjectCard from '@/components/ProjectCard';
import SectionIntro from '@/components/SectionIntro';
import { displayDomain, galleryImages, lines, paragraphs, type GalleryImage } from '@/lib/case-study';
import { projectBySlug, relatedProjects, safeAllProjects } from '@/lib/portfolio';
import { productForCaseStudy } from '@/lib/products';
import { getService, services, serviceStyle } from '@/lib/services';

type Props = { params: Promise<{ slug: string }> };

const loadProject = cache(async (slug: string) => projectBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug).catch(() => null);
  if (!project) return { title: 'Project not found' };
  const description = clip(project.intro || project.summary || `A ${project.client ?? ''} project by Squaberry.`);
  // A pre-rendered share card if there is one, else the first gallery screenshot or the cover.
  const card = `work-${project.slug}`;
  const og = existsSync(path.join(process.cwd(), 'public', 'og', `${card}.jpg`))
    ? card
    : galleryImages(project.gallery)[0]?.src ?? project.image_url ?? 'work';
  const service = getService(project.service_slug);
  return pageMetadata({
    title: service ? `${project.title} case study: ${service.name}` : `${project.title} case study`,
    description,
    path: `/work/${project.slug}`,
    og,
    type: 'article',
  });
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

function Story({ title, text, id, number, lead = false }: { title: string; text: string | null; id: string; number: number; lead?: boolean }) {
  const parts = paragraphs(text);
  if (!parts.length) return null;
  return (
    <section className="case-text" id={id} aria-labelledby={`${id}Title`}>
      <h2 id={`${id}Title`} className="case-heading reveal"><span className="case-heading-num" aria-hidden="true">{String(number).padStart(2, '0')}</span>{title}</h2>
      {parts.map((part, index) => <p className={`reveal${lead && index === 0 ? ' case-lead' : ''}`} key={part.slice(0, 40)}>{part}</p>)}
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();

  const service = getService(project.service_slug);
  const product = productForCaseStudy(slug);
  const scope = lines(project.scope);
  const gallery = galleryImages(project.gallery);
  const [wide, tall, side, ...more] = gallery;
  const domain = displayDomain(project.site_url);
  const related = relatedProjects(await safeAllProjects(), project);
  const helpers = services.filter(item => item.slug !== project.service_slug);
  const helpColumns = service ? [service, ...helpers] : helpers;

  // Story sections in reading order; only those with text appear (and get a number and a sidebar link).
  const story = [
    { id: 'overview', label: 'Overview', text: project.overview },
    { id: 'challenge', label: 'The challenge', text: project.challenge },
    { id: 'solution', label: 'What we built', text: project.solution },
    { id: 'outcome', label: 'The outcome', text: project.results },
  ].filter(section => paragraphs(section.text).length > 0);
  const numberOf = (id: string) => story.findIndex(section => section.id === id) + 1;
  const part = (id: string) => {
    const section = story.find(item => item.id === id);
    return section ? <Story title={section.label} text={section.text} id={section.id} number={numberOf(id)} lead={id === 'overview'} /> : null;
  };
  const visit = project.site_url && (
    <a className="btn is-accent" href={project.site_url} target="_blank" rel="noopener noreferrer">
      <span>Visit the live site</span>
      <span className="btn-icon"><Icon name="arrow-up-right" size={18} /></span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );

  return (
    <main id="main" className="case">
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Our Work', path: '/work' }, { name: project.title, path: `/work/${project.slug}` }]),
          caseStudySchema({ ...project, slug }, project.intro || project.summary || project.title, project.image_url ? absoluteUrl(mediaUrl(project.image_url)) : null),
        ]}
      />
      <PageHero
        label={<><Link href="/work">Projects</Link> <span aria-hidden="true">/</span> {project.title}</>}
        title={project.summary ? <><span className="visually-hidden">{project.title}: </span>{project.summary}</> : project.title}
        size="l"
        lead={project.intro}
        actions={visit}
      />

      {project.image_url && (
        <div className="container case-cover rise d3">
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
      )}

      <div className="container case-layout">
        <aside className="case-side" aria-label="About this project">
          <div className="case-side-inner" data-lenis-prevent>
            {story.length > 1 && <CaseNav sections={story.map(({ id, label }) => ({ id, label }))} articleId="case-article" />}
            <dl className="case-facts">
              {project.client && <div><dt>Industry</dt><dd>{project.client}</dd></div>}
              {service && <div><dt>Service</dt><dd><Link href={`/services/${service.slug}`}>{service.name}</Link></dd></div>}
              {product && <div className="is-wide"><dt>Built on</dt><dd><Link href={`/products/${product.slug}`}>{product.name}</Link></dd></div>}
              {scope.length > 0 && (
                <div className="is-wide">
                  <dt>What we did</dt>
                  <dd><ul className="tag-row">{scope.map(item => <li className="tag" key={item}>{item}</li>)}</ul></dd>
                </div>
              )}
              {project.site_url && (
                <div className="is-wide"><dt>Website</dt><dd><a href={project.site_url} target="_blank" rel="noopener noreferrer">{domain}<span className="visually-hidden"> (opens in a new tab)</span></a></dd></div>
              )}
            </dl>
            {visit}
          </div>
        </aside>

        <article className="case-article" id="case-article" aria-label={`${project.title} case study`}>
          {part('overview')}
          {part('challenge')}
          {wide && <Shot image={wide} sizes="(max-width: 960px) 100vw, 900px" />}
          {part('solution')}
          {(tall || side) && (
            <div className={`case-pair${tall && side ? '' : ' is-single'}`}>
              {tall && <Shot image={tall} sizes="(max-width: 640px) 100vw, 360px" />}
              {side && <Shot image={side} sizes="(max-width: 640px) 100vw, 540px" />}
            </div>
          )}
          {project.quote && (
            <figure className="case-quote reveal">
              <blockquote><p>{project.quote}</p></blockquote>
              {project.quote_name && (
                <figcaption><strong>{project.quote_name}</strong>{project.quote_role && <span>{project.quote_role}</span>}</figcaption>
              )}
            </figure>
          )}
          {part('outcome')}
          {more.map(image => <Shot key={image.src} image={image} sizes="(max-width: 960px) 100vw, 900px" />)}
        </article>
      </div>

      <section className="container section" aria-labelledby="helpTitle">
        <SectionIntro label="How we can help" title="Planning something similar?" id="helpTitle">
          <p>{service ? `This project was led by our ${service.name.toLowerCase()} team. ` : ''}{product && <>The site runs on our <Link className="text-link" href={`/products/${product.slug}`}>{product.name}</Link>, which we can set up for you too. </>}Here’s everything we can bring to yours.</p>
        </SectionIntro>
        <ul className="case-help">
          {helpColumns.map(item => (
            <li key={item.slug} className="reveal" style={{ ['--accent' as string]: serviceStyle[item.slug]?.accent }}>
              <Link href={`/services/${item.slug}`} className="case-help-title">
                <span className="case-help-icon"><Icon name={serviceStyle[item.slug]?.icon ?? 'web'} size={34} /></span>
                <span>{item.name}</span>
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

    </main>
  );
}
