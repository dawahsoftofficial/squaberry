import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import Script from 'next/script';
import { mediaBase } from '@/lib/media-url';
import { siteDescription, siteName, siteUrl } from '@/lib/seo';
import './globals.css';

// Self-hosted at build time by next/font: no requests to Google from visitors' browsers.
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
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

// Runs before first paint.
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
    <html lang="en-GB" className={`${bricolage.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {mediaBase && <link rel="preconnect" href={new URL(mediaBase).origin} />}
        {mediaBase && <link rel="dns-prefetch" href={new URL(mediaBase).origin} />}
        <Script id="reveal-setup" strategy="beforeInteractive">{revealScript}</Script>
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
