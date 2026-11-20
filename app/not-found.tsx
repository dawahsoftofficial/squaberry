import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap not-found">
        <p className="mono">404 / PAGE NOT FOUND</p>
        <h1>Lost the thread.</h1>
        <p>The page you were looking for has moved or never existed. Let’s get you back on track.</p>
        <div className="actions">
          <Link className="button" href="/">Back to the homepage <span className="arrow" aria-hidden="true">↗</span></Link>
          <Link className="text-link" href="/contact">Contact us <span className="arrow" aria-hidden="true">↗</span></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
