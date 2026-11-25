import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import Icon from '@/components/Icon';
import ProjectsBrowser from '@/components/ProjectsBrowser';
import { safeAllProjects } from '@/lib/portfolio';
import { services } from '@/lib/services';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Websites, apps and digital products Squaberry has designed and built: charities, food delivery, e-commerce, education and more.',
  alternates: { canonical: '/work' },
};

export default async function WorkPage() {
  await connection();
  const projects = await safeAllProjects();
  const filters = services
    .map(service => ({ value: service.slug, label: service.name, count: projects.filter(project => project.service_slug === service.slug).length }))
    .filter(filter => filter.count > 0);

  return (
    <main id="main">
      <section className="container page-hero" aria-labelledby="pageTitle" style={{ paddingBottom: 0 }}>
        <span className="pill rise">Selected work</span>
        <h1 id="pageTitle" className="display-xl rise d1">Our work</h1>
        <p className="lead rise d2">Real projects for real organisations: charities, shops, apps and platforms. Every card opens the live site.</p>
      </section>

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
