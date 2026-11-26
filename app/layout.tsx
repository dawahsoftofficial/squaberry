import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// Self-hosted at build time by next/font: no requests to Google from visitors' browsers.
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://squaberry.co.uk'),
  title: {
    default: 'Squaberry — Fresh ideas. Solid tech.',
    template: '%s — Squaberry',
  },
  description: 'Squaberry brings thoughtful design, web development, digital marketing and IT support together. Fresh ideas. Solid tech.',
  icons: { icon: { url: '/assets/squaberry-logo.svg', type: 'image/svg+xml' } },
  openGraph: { type: 'website', siteName: 'Squaberry', locale: 'en_GB' },
};

// Runs before first paint: lets scroll reveals hide content until it animates in. Skipped under reduced
// motion; if the reveal script hasn't started within 3s, everything is shown as normal.
const revealScript = `(function(){var d=document.documentElement;if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('js-reveal');setTimeout(function(){if(!d.classList.contains('reveal-ready'))d.classList.remove('js-reveal')},3000)})();`;

export const viewport: Viewport = {
  themeColor: '#1c1c1c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${bricolage.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <Script id="reveal-setup" strategy="beforeInteractive">{revealScript}</Script>
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
