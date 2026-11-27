import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import Icon from '@/components/Icon';
import ProcessSteps from '@/components/ProcessSteps';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import SectionIntro from '@/components/SectionIntro';
import { services, serviceStyle } from '@/lib/services';

export const metadata: Metadata = pageMetadata({
  title: 'Services: development, design, marketing & IT',
  description: 'Web and app development, design, digital marketing and IT support: everything Squaberry offers, under one roof, from first idea to launch and beyond.',
  path: '/services',
  og: 'services',
});

export default function ServicesPage() {
  return (
    <main id="main">
      <JsonLd data={breadcrumbSchema([{ name: 'Services', path: '/services' }])} />
      <PageHero
        label="What we do"
        title={<>One partner.<br />Every piece.</>}
        lead="Your website, your workflows and the systems behind the scenes. Pick a starting point, or tell us the challenge and we’ll shape the right mix."
        aside={(
          <ul className="hero-services" aria-label="Our services">
            {services.map(service => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                  <span className="hero-svc-icon"><Icon name={serviceStyle[service.slug].icon} size={26} /></span>
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        actions={<Link className="btn is-lg" href="/contact#enquiry"><span>Start a project</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>}
      />

      <section className="panel panel-lav section" aria-labelledby="listTitle">
        <div className="container">
          <SectionIntro label={`${services.length} services`} title="Built around how you work." id="listTitle" tone="light">
            <p>Each service stands on its own, and they work best together: one team that understands the whole picture.</p>
          </SectionIntro>
          <div className="svc-grid">
            {services.map(service => (
              <Link href={`/services/${service.slug}`} className="svc-card reveal" key={service.slug} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                <span className="svc-top">
                  <span className="svc-icon"><Icon name={serviceStyle[service.slug].icon} size={38} /></span>
                  <span className="svc-num">{service.number}</span>
                </span>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <span className="text-link">{service.tags.join(' · ')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="processTitle">
        <SectionIntro label="How we work" title="A clear path, start to finish." id="processTitle">
          <p>Whatever the service, every project follows the same simple rhythm, with shared decisions and visible progress.</p>
        </SectionIntro>
        <ProcessSteps />
      </section>
    </main>
  );
}
