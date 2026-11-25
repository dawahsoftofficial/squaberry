'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window { squaberryLenis?: Lenis }
}

/**
 * Soft inertia scrolling (Lenis) for the public site. Skipped entirely for visitors who prefer
 * reduced motion. In-page #anchor links are animated too. After each route change Lenis is
 * re-synced to wherever Next.js put the page, so the next wheel tick never jumps back.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -96 } });
    window.squaberryLenis = lenis;
    return () => {
      lenis.destroy();
      delete window.squaberryLenis;
    };
  }, []);

  useEffect(() => {
    const lenis = window.squaberryLenis;
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
