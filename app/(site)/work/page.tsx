import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import ProjectsBrowser from '@/components/ProjectsBrowser';
import { safeAllProjects } from '@/lib/portfolio';
import { services } from '@/lib/services';
import { toCardProject } from '@/lib/case-study';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Websites, apps and digital products Squaberry has designed and built: charities, food delivery, e-commerce, education and more.',
  alternates: { canonical: '/work' },
};

export default async function WorkPage() {
  await connection();
  const projects = (await safeAllProjects()).map(toCardProject);
  const filters = services
    .map(service => ({ value: service.slug, label: service.name, count: projects.filter(project => project.service_slug === service.slug).length }))
    .filter(filter => filter.count > 0);
  const sectors = new Set(projects.map(project => project.client).filter(Boolean)).size;

  return (
    <main id="main">
      <PageHero
        label="Selected work"
        title={<>Work we’re<br />proud of.</>}
        lead="Real projects for real organisations: charities, shops, apps and platforms. Open any project to see how we built it."
        aside={projects.length > 0 && (
          <dl className="hero-stats">
            <div><dt>Projects</dt><dd>{projects.length}</dd></div>
            <div><dt>Sectors</dt><dd>{sectors}</dd></div>
            <div><dt>Services</dt><dd>{filters.length}</dd></div>
          </dl>
        )}
      />

      <section className="container section-tight" aria-label="Projects">
        {projects.length ? (
          <ProjectsBrowser filters={filters} projects={projects} />
        ) : (
          <div className="empty-card">
            <div>
              <h2 className="display-m">Projects are on their way.</h2>
              <p>Get in touch and we’ll share work that’s relevant to you.</p>
            </div>
          </div>
        )}
      </section>

      <section className="section-tight">
        <div className="panel panel-cream cta-panel reveal">
          <h2 className="display-l">Your project could be next.</h2>
          <div className="cta-side">
            <p>Tell us what you’re building. Three quick steps and we’ll reply by email.</p>
            <Link className="btn is-dark is-lg" href="/contact#enquiry"><span>Start a project</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
