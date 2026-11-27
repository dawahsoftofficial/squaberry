import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import EnquiryForm from '@/components/EnquiryForm';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbSchema, serviceSchema } from '@/lib/schema';
import { absoluteUrl, clip, ogImage } from '@/lib/seo';
import { productsForService } from '@/lib/products';
import ProjectCard from '@/components/ProjectCard';
import SectionIntro from '@/components/SectionIntro';
import { safeServiceProjects } from '@/lib/portfolio';
import { getService, inSentence, services, serviceStyle } from '@/lib/services';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map(service => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return pageMetadata({
    title: `${service.name} services`,
    description: clip(service.description ?? service.summary),
    path: `/services/${service.slug}`,
    og: `service-${service.slug}`,
  });
}

// Card widths for 1, 2 or more projects so the grid always fills neatly.
const spanFor = (index: number, total: number) =>
  total === 1 || (total % 2 === 1 && index === total - 1) ? 'span-12' : ['span-7', 'span-5', 'span-5', 'span-7'][index % 4];

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  await connection(); // Render per request so new portfolio items appear without a rebuild.
  const projects = await safeServiceProjects(service.slug);
  const others = services.filter(other => other.slug !== service.slug);
  const related = productsForService(service.slug);
  const style = serviceStyle[service.slug];

  return (
    <main id="main">
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Services', path: '/services' }, { name: service.name, path: `/services/${service.slug}` }]),
          serviceSchema(service, absoluteUrl(ogImage(`service-${service.slug}`))),
        ]}
      />
      <PageHero
        titleId="serviceTitle"
        label={<><Link href="/services">Services</Link> <span aria-hidden="true">/</span> {service.number}</>}
        title={service.name}
        lead={service.intro}
        actions={(
          <>
            <a className="btn is-lg" href="#enquiry"><span>Start a conversation</span><span className="btn-icon"><Icon name="arrow-down" size={20} /></span></a>
            {projects.length > 0 && <a className="text-link" href="#work">See our work</a>}
          </>
        )}
      />

      <section className="container section-tight" aria-labelledby="overviewTitle">
        <div className="split">
          <figure className="visual-card tilt-in">
            <Image src={`/assets/services/${service.slug}.png`} alt={service.imageAlt ?? `${service.name} illustration`} width={896} height={1120} sizes="(max-width: 960px) 90vw, 45vw" priority />
            <ul className="tag-row">{service.tags.map(tag => <li className="tag" key={tag}>{tag}</li>)}</ul>
          </figure>
          <div className="overview">
            <span className="pill reveal">Why it matters</span>
            <h2 id="overviewTitle" className="display-l reveal">{service.headline[0]} <span className="text-lav">{service.headline[1]}</span></h2>
            <p className="lead reveal">{service.summary}</p>
            <ul className="tag-row overview-tags reveal">{service.tags.map(tag => <li className="chip" key={tag}>{tag}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="deliverTitle">
        <SectionIntro label="What’s included" title="Everything it takes." id="deliverTitle">
          <p>Every project is shaped around you, but these are the pieces we most often bring together.</p>
        </SectionIntro>
        <ul className="feature-grid">
          {service.deliverables.map((item, index) => (
            <li className="feature-card reveal" key={item.title} style={{ ['--accent' as string]: style.accent }}>
              <span className="pill">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel panel-cream section" aria-labelledby="fitTitle">
        <div className="container split" style={{ alignItems: 'start' }}>
          <SectionIntro label="Is this for you?" title="A good fit when…" id="fitTitle" tone="light" />
          <ul className="fit-list">
            {service.fit.map(item => (
              <li className="reveal" key={item}><span className="fit-icon"><Icon name="check" size={18} /></span>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container section" id="work" aria-labelledby="workTitle">
        <SectionIntro label="Selected work" title="Work we’re proud of." id="workTitle">
          <p>{projects.length ? `A look at ${inSentence(service.name)} projects we’ve delivered. Open one to see how we built it.` : `We’re adding recent ${inSentence(service.name)} projects here.`}</p>
        </SectionIntro>
        {projects.length ? (
          <div className="bento work-grid">
            {projects.map((project, index) => <ProjectCard key={project.id} project={project} className={spanFor(index, projects.length)} />)}
          </div>
        ) : (
          <div className="empty-card reveal">
            <span className="feature-icon" style={{ ['--accent' as string]: style.accent }}><Icon name={style.icon} size={40} /></span>
            <div>
              <h3>New work is on its way.</h3>
              <p>Ask for examples when you get in touch and we’ll share work relevant to you, or <Link className="text-link" href="/work">browse all projects</Link>.</p>
            </div>
          </div>
        )}
      </section>

      <section className="container section-tight" id="enquiry" aria-labelledby="formTitle">
        <div className="form-layout">
          <div className="form-intro">
            <span className="pill">Start a conversation</span>
            <h2 id="formTitle" className="display-l">Let’s talk {service.shortName}.</h2>
            <p className="lead">Tell us a little about what you need. Three quick steps, and we’ll reply by email.</p>
          </div>
          <EnquiryForm defaultTopic={service.name} source={`Service: ${service.name}`} />
        </div>
      </section>

      {related.length > 0 && (
        <nav className="container section" aria-labelledby="productsTitle">
          <SectionIntro label="Ready-made products" title="Or start from a proven product." id="productsTitle">
            <p>Software we’ve already built and run, set up in your brand by the same team.</p>
          </SectionIntro>
          <ul className="link-list">
            {related.map(product => (
              <li key={product.slug}>
                <Link href={`/products/${product.slug}`} style={{ ['--accent' as string]: product.accent }}>
                  <span className="link-icon"><Icon name={product.icon} size={32} /></span>
                  <span className="link-name">{product.name}</span>
                  <span className="link-go" aria-hidden="true"><Icon name="arrow-up-right" size={18} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav className="container section" aria-labelledby="othersTitle">
        <SectionIntro label="Keep exploring" title="More ways we can help." id="othersTitle" />
        <ul className="link-list">
          {others.map(other => (
            <li key={other.slug}>
              <Link href={`/services/${other.slug}`} style={{ ['--accent' as string]: serviceStyle[other.slug].accent }}>
                <span className="link-icon"><Icon name={serviceStyle[other.slug].icon} size={32} /></span>
                <span className="link-name">{other.name}</span>
                <span className="link-go" aria-hidden="true"><Icon name="arrow-up-right" size={18} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
