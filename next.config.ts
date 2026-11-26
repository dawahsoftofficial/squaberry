import type { NextConfig } from 'next';
import { deviceSizes, imageSizes } from './lib/media.mjs';
import { hiddenServiceSlugs } from './lib/services';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Images are served from DigitalOcean Spaces as pre-resized WebP files (lib/image-loader.ts), so the
  // widths here must match the ones uploaded by scripts/upload-media.mjs (both read lib/media.mjs).
  images: { loader: 'custom', loaderFile: './lib/image-loader.ts', deviceSizes, imageSizes },
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
      // Media normally comes from Spaces; these cover the local copies and the icons the site serves itself.
      ...['/assets/:path*', '/og/:path*', '/icon-:size.png'].map(source => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      })),
    ];
  },
};

export default nextConfig;
