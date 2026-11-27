import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    start_url: '/',
    display: 'browser',
    background_color: '#1c1c1c',
    theme_color: '#1c1c1c',
    icons: [
      { src: '/icon-hand-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-hand-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-hand-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
