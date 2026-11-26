import RevealObserver from '@/components/RevealObserver';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import SmoothScroll from '@/components/SmoothScroll';

/** Shared chrome for every public page. Each page renders its own <main id="main">. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <RevealObserver />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
