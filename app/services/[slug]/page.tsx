import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import EnquiryForm from '@/components/EnquiryForm';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { listPublishedPortfolio, type PortfolioItem } from '@/lib/data';
import { getService, services } from '@/lib/services';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map(service => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.summary} ${service.tags.join(', ')} from Squaberry.`,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.name} — Squaberry`, description: service.summary, images: [`/assets/services/${service.slug}.png`] },
  };
}

async function loadPortfolio(slug: string): Promise<PortfolioItem[]> {
  try {
    return await listPublishedPortfolio(slug);
  } catch (error) {
    // The page still works if the database is unreachable; the portfolio shows its empty state.
    console.error('Portfolio could not be loaded:', error instanceof Error ? error.message : error);
    return [];
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  await connection(); // Render per request so new portfolio items appear without a rebuild.
  const portfolio = await loadPortfolio(service.slug);
  const others = services.filter(other => other.slug !== service.slug);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="top">
          <section className="wrap service-hero" aria-labelledby="serviceTitle">
            <div className="service-hero-copy">
              <p className="mono eyebrow">
                <span className="dot" aria-hidden="true"></span>
                <Link href="/#services">WHAT WE DO</Link> / {service.number} / {service.name.toUpperCase()}
              </p>
              <h1 id="serviceTitle"><span>{service.headline[0]}</span> <span className="accent">{service.headline[1]}</span></h1>
              <p>{service.intro}</p>
              <div className="actions">
                <a className="button" href="#enquiry">Start a conversation <span className="arrow" aria-hidden="true">↓</span></a>
                <a className="text-link" href="#work">See our work <span className="arrow" aria-hidden="true">↓</span></a>
              </div>
              <p className="mono hero-note">{service.tags.join(' / ').toUpperCase()}</p>
            </div>
            <figure className="service-hero-art">
              <Image
                src={`/assets/services/${service.slug}.png`}
                alt=""
                width={896}
                height={1120}
                priority
                sizes="(max-width: 720px) 90vw, 40vw"
              />
              <span className="mono art-label tl">SQ—{service.number} / {service.shortName.toUpperCase()}</span>
              <span className="mono art-label br">[ SB ]</span>
            </figure>
          </section>
        </div>

        <section className="wrap section deliverables-section" aria-labelledby="deliverTitle">
          <div className="section-heading is-split">
            <div><p className="mono">01 / WHAT WE DELIVER</p><h2 id="deliverTitle">What’s included.</h2></div>
            <p>Every project is shaped around you, but these are the pieces we most often bring together.</p>
          </div>
          <ul className="deliverables">
            {service.deliverables.map((item, index) => (
              <li className="deliverable" key={item.title}>
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="fit-band" aria-labelledby="fitTitle">
          <div className="wrap fit-inner">
            <div><p className="mono">02 / IS THIS FOR YOU?</p><h2 id="fitTitle">A good fit<br /><span className="acid-text">when…</span></h2></div>
            <ul className="fit-list">
              {service.fit.map(item => <li key={item}><span aria-hidden="true">↳</span>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="wrap section portfolio-section" id="work" aria-labelledby="workTitle">
          <div className="section-heading is-split">
            <div><p className="mono">03 / SELECTED WORK</p><h2 id="workTitle">Work we’re proud of.</h2></div>
            <p>A look at {service.name.toLowerCase()} projects we’ve delivered.</p>
          </div>
          {portfolio.length ? (
            <ul className="portfolio-grid">
              {portfolio.map(item => (
                <li className="portfolio-card" key={item.id}>
                  <div className="portfolio-media">
                    {item.image_url?.startsWith('/') ? (
                      // Images stored in /public are resized and compressed by Next.js.
                      <Image src={item.image_url} alt={`Preview of ${item.title}`} fill sizes="(max-width: 720px) 90vw, (max-width: 1200px) 45vw, 30vw" />
                    ) : item.image_url ? (
                      <img src={item.image_url} alt={`Preview of ${item.title}`} loading="lazy" />
                    ) : (
                      <span className="portfolio-placeholder" aria-hidden="true"><img src="/assets/squaberry-mark.svg" alt="" /></span>
                    )}
                  </div>
                  <div className="portfolio-body">
                    {item.client && <p className="mono">{item.client}</p>}
                    <h3>{item.title}</h3>
                    {item.summary && <p>{item.summary}</p>}
                    {item.site_url && (
                      <a href={item.site_url} target="_blank" rel="noopener noreferrer">
                        Visit {hostOf(item.site_url)} <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="portfolio-empty">
              <img src="/assets/squaberry-mark.svg" alt="" aria-hidden="true" />
              <div>
                <h3>New work is on its way.</h3>
                <p>We’re adding recent {service.name.toLowerCase()} projects here. Ask for examples when you get in touch and we’ll share work relevant to you.</p>
              </div>
            </div>
          )}
        </section>

        <section className="contact-form-section" id="enquiry" aria-labelledby="formTitle">
          <div className="wrap contact-form-layout">
            <div className="contact-form-intro">
              <p className="mono">04 / START A CONVERSATION</p>
              <h2 id="formTitle">Let’s talk<br />{service.shortName}.</h2>
              <p>Tell us a little about what you need. A few lines is plenty, and we’ll reply by email.</p>
              <p className="form-required-note">Fields marked <span aria-hidden="true">*</span><span className="visually-hidden">with an asterisk</span> are required.</p>
            </div>
            <EnquiryForm defaultTopic={service.name} source={`Service: ${service.name}`} />
          </div>
        </section>

        <nav className="wrap section other-services" aria-labelledby="othersTitle">
          <p className="mono" id="othersTitle">MORE WAYS WE CAN HELP</p>
          <ul>
            {others.map(other => (
              <li key={other.slug}>
                <Link href={`/services/${other.slug}`}>
                  <span className="mono service-num">{other.number}</span>
                  <span className="other-name">{other.name}</span>
                  <span className="arrow" aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
