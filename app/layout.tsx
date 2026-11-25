import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
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

export const viewport: Viewport = {
  themeColor: '#1c1c1c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${bricolage.variable} ${figtree.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
