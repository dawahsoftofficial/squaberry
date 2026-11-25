import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import SectionIntro from '@/components/SectionIntro';
import { processSteps } from '@/lib/process';
import { services, serviceStyle } from '@/lib/services';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Web and app development, design, digital marketing and IT support: everything Squaberry offers, under one roof.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <main id="main">
      <PageHero
        label="What we do"
        title={<>One partner.<br />Every piece.</>}
        lead="Your website, your workflows and the systems behind the scenes. Pick a starting point, or tell us the challenge and we’ll shape the right mix."
        aside={(
          <ul className="hero-services" aria-label="Our services">
            {services.map(service => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                  <span className="hero-svc-icon"><Icon name={serviceStyle[service.slug].icon} size={18} /></span>
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
                  <span className="svc-icon"><Icon name={serviceStyle[service.slug].icon} size={26} /></span>
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
        <ol className="feature-grid cols-4">
          {processSteps.map((step, index) => (
            <li className="feature-card reveal" key={step.name} style={{ ['--accent' as string]: step.accent }}>
              <span className="feature-icon"><Icon name={step.icon} size={28} /></span>
              <span className="pill">Step 0{index + 1}</span>
              <h3>{step.name}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
