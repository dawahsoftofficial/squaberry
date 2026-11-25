import type { NextConfig } from 'next';
import { hiddenServiceSlugs } from './lib/services';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // The old static site used .html URLs; send visitors and search engines to the new routes.
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/terms.html', destination: '/terms', permanent: true },
      { source: '/privacy.html', destination: '/privacy', permanent: true },
      // Hidden services (lib/services.ts): temporary, so the pages can come back later.
      ...hiddenServiceSlugs.map(slug => ({ source: `/services/${slug}`, destination: '/services', permanent: false })),
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
