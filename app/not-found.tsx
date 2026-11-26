import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import RevealObserver from '@/components/RevealObserver';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <RevealObserver />
      <SiteHeader />
      <main id="main" className="container page-hero">
        <p className="not-found-code rise" aria-hidden="true">404</p>
        <h1 className="display-l rise d1">Lost the thread.</h1>
        <p className="lead rise d2">The page you were looking for has moved or never existed. Let’s get you back on track.</p>
        <div className="hero-actions rise d3">
          <Link className="btn is-lg" href="/"><span>Back to the homepage</span><span className="btn-icon"><Icon name="arrow-up-right" size={20} /></span></Link>
          <Link className="text-link" href="/contact">Contact us</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
