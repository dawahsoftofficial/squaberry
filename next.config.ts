import type { NextConfig } from 'next';
import { deviceSizes, imageSizes } from './lib/media.mjs';
import { hiddenServiceSlugs } from './lib/services';

const dev = process.env.NODE_ENV !== 'production';

// Content Security Policy: scripts, styles, fonts and requests only from this site; images from the
// site, the Spaces CDN and other https addresses (projects may use external images); no plugins, no
// framing, forms post only here. Next.js needs inline scripts and styles; dev mode also needs eval and
// the hot-reload socket.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
  "media-src 'self' https:",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  ...(dev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Images are served from DigitalOcean Spaces as pre-resized WebP files (lib/image-loader.ts), so the
  // widths here must match the ones uploaded by scripts/upload-media.mjs (both read lib/media.mjs).
  // Form posts are small (messages are capped at 5,000 characters), so reject anything larger early.
  experimental: { serverActions: { bodySizeLimit: '100kb' } },
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
        headers: securityHeaders,
      },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // Media normally comes from Spaces; these cover the local copies and the icons the site serves itself.
      ...['/assets/:path*', '/og/:path*', '/icon-:size.png'].map(source => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      })),
      // The brand icon sprite; its URL carries a content version, so it can be cached for good.
      { source: '/icons.svg', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};

export default nextConfig;
