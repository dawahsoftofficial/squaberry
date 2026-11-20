import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { listPortfolio, type PortfolioItem } from '@/lib/data';
import { services } from '@/lib/services';

export const metadata: Metadata = { title: 'Portfolio' };

type Props = { searchParams: Promise<{ saved?: string; deleted?: string }> };

export default async function PortfolioAdminPage({ searchParams }: Props) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;
  let items: PortfolioItem[] = [];
  let failed = false;
  try {
    items = await listPortfolio();
  } catch (error) {
    failed = true;
    console.error('Admin portfolio could not be loaded:', error instanceof Error ? error.message : error);
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="mono">PORTFOLIO</p>
          <h1>Selected work.</h1>
        </div>
        <Link className="button" href="/admin/portfolio/new">Add a project <span className="arrow" aria-hidden="true">+</span></Link>
      </div>

      {saved && <p className="admin-flash" role="status">Project saved.</p>}
      {deleted && <p className="admin-flash" role="status">Project deleted.</p>}
      {failed && <p className="admin-flash is-error" role="alert">The database couldn’t be reached. Check the DB_* settings and try again.</p>}

      {services.map(service => {
        const forService = items.filter(item => item.service_slug === service.slug);
        return (
          <section className="admin-group" key={service.slug} aria-labelledby={`group-${service.slug}`}>
            <div className="admin-group-head">
              <h2 id={`group-${service.slug}`}><span className="mono">{service.number}</span> {service.name}</h2>
              <a href={`/services/${service.slug}#work`} target="_blank" rel="noopener noreferrer">View page <span aria-hidden="true">↗</span></a>
            </div>
            {forService.length ? (
              <ul className="portfolio-admin-list">
                {forService.map(item => (
                  <li key={item.id}>
                    <Link href={`/admin/portfolio/${item.id}`}>
                      <span className="portfolio-admin-thumb">
                        {item.image_url ? <img src={item.image_url} alt="" /> : <img src="/assets/squaberry-mark.svg" alt="" />}
                      </span>
                      <span className="portfolio-admin-text">
                        <strong>{item.title}</strong>
                        <span>{[item.client, item.site_url].filter(Boolean).join(' · ') || 'No client or link yet'}</span>
                      </span>
                      <span className={`status-badge ${item.published ? 'is-read' : 'is-archived'}`}>{item.published ? 'live' : 'hidden'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-muted admin-group-empty">No projects yet. The page shows a “new work is on its way” message.</p>
            )}
          </section>
        );
      })}
    </>
  );
}
