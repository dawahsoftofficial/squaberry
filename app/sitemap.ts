import type { MetadataRoute } from 'next';
import { services } from '@/lib/services';

const base = 'https://squaberry.co.uk';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/about`, priority: 0.8 },
    { url: `${base}/services`, priority: 0.9 },
    { url: `${base}/work`, priority: 0.9 },
    ...services.map(service => ({ url: `${base}/services/${service.slug}`, priority: 0.8 })),
    { url: `${base}/contact`, priority: 0.7 },
    { url: `${base}/privacy`, priority: 0.2 },
    { url: `${base}/terms`, priority: 0.2 },
  ];
}
