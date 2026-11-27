import type { MetadataRoute } from 'next';
import { listPublishedProjectDates } from '@/lib/data';
import { products } from '@/lib/products';
import { absoluteUrl } from '@/lib/seo';
import { services } from '@/lib/services';

// Re-read hourly so new project pages appear without a rebuild.
export const revalidate = 3600;

/** Published projects with a page, and when each was last edited; none if the database is down. */
async function projectDates(): Promise<{ slug: string; updated_at: Date }[]> {
  try {
    return await listPublishedProjectDates();
  } catch (error) {
    console.error('Sitemap projects could not be loaded:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Only project pages carry lastModified (their last edit in the admin). The other pages are written in
// code and have no reliable edit date, and a date that changes on every deploy would only mislead crawlers.
// Hidden services are already left out of `services`; /admin is never listed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await projectDates();
  const latestProject = projects.reduce<Date | undefined>((latest, { updated_at }) => (!latest || updated_at > latest ? updated_at : latest), undefined);
  return [
    { url: absoluteUrl('/'), priority: 1 },
    { url: absoluteUrl('/about'), priority: 0.8 },
    { url: absoluteUrl('/services'), priority: 0.9 },
    ...services.map(service => ({ url: absoluteUrl(`/services/${service.slug}`), priority: 0.8 })),
    { url: absoluteUrl('/work'), priority: 0.9, ...(latestProject ? { lastModified: latestProject } : {}) },
    ...projects.map(project => ({ url: absoluteUrl(`/work/${project.slug}`), lastModified: project.updated_at, priority: 0.7 })),
    { url: absoluteUrl('/products'), priority: 0.9 },
    ...products.map(product => ({ url: absoluteUrl(`/products/${product.slug}`), priority: 0.8 })),
    { url: absoluteUrl('/contact'), priority: 0.7 },
    { url: absoluteUrl('/privacy'), priority: 0.2 },
    { url: absoluteUrl('/terms'), priority: 0.2 },
  ];
}
