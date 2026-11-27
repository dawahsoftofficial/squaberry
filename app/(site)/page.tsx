import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { connection } from 'next/server';
import EnquiryForm from '@/components/EnquiryForm';
import Icon from '@/components/Icon';
import ProcessSteps from '@/components/ProcessSteps';
import ProjectCard from '@/components/ProjectCard';
import SectionIntro from '@/components/SectionIntro';
import TypeLine from '@/components/TypeLine';
import { safeAllProjects } from '@/lib/portfolio';
import { services, serviceStyle } from '@/lib/services';

export const metadata: Metadata = pageMetadata({
  title: 'Squaberry — Web design, app development & digital marketing',
  absoluteTitle: true,
  description: 'Squaberry designs and builds fast websites, apps and custom software, and helps businesses grow with digital marketing and dependable IT support.',
  path: '/',
  og: 'home',
});

// The hero's typed second line. The first phrase is what renders without JS and what screen readers hear.
const heroPhrases = ['Solid tech.', 'Smart apps.', 'Bold brands.', 'Real growth.'];

export default async function HomePage() {
  await connection(); // Projects come from the database, so render per request.
  const projects = await safeAllProjects();
  const [p0, p1, p2, p3, p4] = projects;

  return (
    <main id="main">
      <section className="container home-hero" aria-labelledby="heroTitle">
        <div>
          <span className="pill rise">Independent thinking. Connected technology.</span>
          <h1 id="heroTitle" className="display-xl rise d1">Fresh ideas.<br /><TypeLine phrases={heroPhrases} /></h1>
          <p className="lead rise d2">From the first sketch to the systems behind it, we make technology feel clear, useful and full of possibility.</p>
          <ul className="hero-services rise d3" aria-label="What we do">
            {services.map(service => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                  <span className="hero-svc-icon"><Icon name={serviceStyle[service.slug].icon} size={26} /></span>
                  {service.shortName === 'IT' ? 'IT support' : service.shortName.charAt(0).toUpperCase() + service.shortName.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hero-actions rise d4">
            <Link className="btn is-lg" href="/work"><span>See our work</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
            <Link className="text-link" href="/services">Explore services</Link>
          </div>
        </div>
        <div className="hero-form rise d2">
          <EnquiryForm variant="compact" source="Homepage" id="start" />
        </div>
      </section>

      <section className="container section-tight home-work" aria-labelledby="workTitle">
        <SectionIntro label="Selected work" title="Built for people who rely on it." id="workTitle">
          <p>Charities, shops, apps and platforms we’ve designed and built. <Link className="text-link" href="/work">See all {projects.length || ''} projects</Link></p>
        </SectionIntro>
        <div className="bento">
          {p0 && <ProjectCard project={p0} className="span-12" featured priority />}
          {p1 && <ProjectCard project={p1} className="span-6" />}
          {p2 && <ProjectCard project={p2} className="span-6" />}
          {p3 && <ProjectCard project={p3} className="span-6" />}
          {p4 && <ProjectCard project={p4} className="span-6" />}
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section-tight clients" aria-labelledby="clientsTitle">
          <div className="container">
            <h2 id="clientsTitle" className="display-l reveal" style={{ maxWidth: '14ch', marginBottom: 'clamp(32px,4vw,56px)' }}>Brands we’ve helped grow</h2>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[0, 1].map(copy => (
                <div className="marquee-group" key={copy}>
                  {projects.map(project => (
                    <span className="client-chip" key={`${copy}-${project.id}`}>
                      <span className="client-dot" style={{ ['--dot' as string]: serviceStyle[project.service_slug]?.accent }} />
                      {project.title}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="visually-hidden">Clients include {projects.map(project => project.title).join(', ')}.</p>
        </section>
      )}

      <section className="panel panel-lav section" aria-labelledby="servicesTitle">
        <div className="container">
          <SectionIntro label="Our services" title="One partner for every piece." id="servicesTitle" tone="light">
            <p>Your website, your workflows and the systems behind the scenes. We make the whole thing work better, together.</p>
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
                <span className="text-link">Explore <Icon name="arrow-right" size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="processTitle">
        <SectionIntro label="How we work" title="From “what if” to “it works.”" id="processTitle">
          <p>A clear path, shared decisions and a team that stays connected to the detail, from the first call to long after launch.</p>
        </SectionIntro>
        <ProcessSteps />
      </section>

      <section className="container section-tight statement" aria-label="About Squaberry">
        <p className="text-reveal">Square gives us structure. Berry gives us character. Together, they remind us that good technology takes clear thinking and a little imagination.</p>
        <p className="reveal">That’s how we work: thoughtful design, careful engineering and a human touch from the very first conversation. <Link className="text-link" href="/about">More about us</Link></p>
      </section>

      <section className="section-tight">
        <div className="panel panel-cream cta-panel reveal">
          <h2 className="display-l">Let’s make something work.</h2>
          <div className="cta-side">
            <p>A project, a question or a tricky challenge: tell us about it. No perfect brief required.</p>
            <Link className="btn is-dark is-lg" href="/contact#enquiry"><span>Start a project</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
