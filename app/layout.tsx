import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import localFont from 'next/font/local';
import { mediaBase } from '@/lib/media-url';
import { siteDescription, siteName, siteUrl } from '@/lib/seo';
import './globals.css';

// Self-hosted by next/font: no requests to Google from visitors' browsers.
// Headings: Fraunces with its soft, slightly wonky forms. The site only ever uses SOFT 100 and WONK 1, so
// app/fonts holds the Latin variable font with those two axes pinned (scripts/build-fraunces.py): the same
// glyphs at half the size (62kb instead of 121kb). Weight and optical size are still variable.
const fraunces = localFont({
  src: './fonts/fraunces-latin-soft-wonk.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-fraunces',
  display: 'swap',
  // The fallback face (metrics from next/font/google, tuned to the regular weight) is in globals.css.
  adjustFontFallback: false,
  fallback: ['Fraunces Fallback'],
});
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Squaberry — Web design, app development & digital marketing',
    template: '%s — Squaberry',
  },
  description: siteDescription,
  applicationName: siteName,
  creator: siteName,
  publisher: siteName,
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { type: 'website', siteName, locale: 'en_GB' },
  twitter: { card: 'summary_large_image' },
};

// Runs before first paint: a plain inline <script> in <head>, not next/script's beforeInteractive, which
// in the App Router only runs once Next's async runtime has loaded, often after the first paint.
// - js-form: step forms show only their opening step until they hydrate, so the page doesn't jump when
//   the full no-JS form collapses into steps. If a form still hasn't hydrated after 6s, all steps show.
// - js-reveal: lets scroll reveals hide content until it animates in. Skipped under reduced motion; if
//   the reveal script hasn't started within 3s, everything is shown as normal.
const revealScript = `(function(){var d=document.documentElement;d.classList.add('js-form');setTimeout(function(){if(document.querySelector('.step-form:not(.is-enhanced):not(.step-success)'))d.classList.remove('js-form')},6000);if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('js-reveal');setTimeout(function(){if(!d.classList.contains('reveal-ready'))d.classList.remove('js-reveal')},3000)})();`;

export const viewport: Viewport = {
  themeColor: '#1c1c1c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {mediaBase && <link rel="preconnect" href={new URL(mediaBase).origin} />}
        {mediaBase && <link rel="dns-prefetch" href={new URL(mediaBase).origin} />}
        <script id="reveal-setup" dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
