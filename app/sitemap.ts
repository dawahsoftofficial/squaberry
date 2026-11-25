import type { MetadataRoute } from 'next';
import { safeAllProjects } from '@/lib/portfolio';
import { services } from '@/lib/services';

const base = 'https://squaberry.co.uk';

// Re-read hourly so new project pages appear without a rebuild.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = (await safeAllProjects()).filter(project => project.slug);
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/about`, priority: 0.8 },
    { url: `${base}/services`, priority: 0.9 },
    { url: `${base}/work`, priority: 0.9 },
    ...projects.map(project => ({ url: `${base}/work/${project.slug}`, priority: 0.7 })),
    ...services.map(service => ({ url: `${base}/services/${service.slug}`, priority: 0.8 })),
    { url: `${base}/contact`, priority: 0.7 },
    { url: `${base}/privacy`, priority: 0.2 },
    { url: `${base}/terms`, priority: 0.2 },
  ];
}
