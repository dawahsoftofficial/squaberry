import type { Metadata, Viewport } from 'next';
import './globals.css';
import './site.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://squaberry.co.uk'),
  title: {
    default: 'Squaberry — Fresh ideas. Solid tech. | squaberry.co.uk',
    template: '%s — squaberry.co.uk',
  },
  description: 'Squaberry brings thoughtful design, web development, cloud, automation and IT support together. Fresh ideas. Solid tech.',
  icons: { icon: { url: '/assets/squaberry-logo.svg', type: 'image/svg+xml' } },
  openGraph: { type: 'website', siteName: 'Squaberry', locale: 'en_GB' },
};

export const viewport: Viewport = {
  themeColor: '#E6FF00',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior lets Next.js turn off the stylesheet's smooth scrolling while it resets the
    // scroll position on navigation. Without it, Next 16 animates that reset and can stop at the footer.
    <html lang="en-GB" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
