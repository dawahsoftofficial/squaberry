'use client';

import { useEffect } from 'react';

const SELECTOR = '.reveal, .tilt-in, .text-reveal';
const ICON_SELECTOR = '.brand-icon';
const STEP_MS = 90;
const MAX_STEPS = 6;

/**
 * Scroll reveals for every browser. The inline script in the root layout adds `js-reveal` to <html>
 * (unless reduced motion is on), which hides revealable elements; this observer adds `is-in` as each
 * one enters the viewport, staggering elements that arrive together, then `is-done` so the element's
 * own hover transitions take over. New elements (route changes, filters) are picked up automatically.
 *
 * It also marks hand-drawn icons with `is-live` while they are on screen, which is when their line boil
 * runs (see globals.css): animating every icon on the page all the time kept the main thread busy.
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const revealing = root.classList.contains('js-reveal');

    const timers = new Set<number>();
    const io = new IntersectionObserver(
      entries => {
        const entering = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target as HTMLElement)
          .sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return Math.round(ra.top - rb.top) || ra.left - rb.left;
          });
        entering.forEach((element, index) => {
          const delay = Math.min(index, MAX_STEPS) * STEP_MS;
          element.style.setProperty('--reveal-delay', `${delay}ms`);
          element.classList.add('is-in');
          io.unobserve(element);
          const timer = window.setTimeout(() => {
            element.classList.add('is-done');
            timers.delete(timer);
          }, delay + 1300);
          timers.add(timer);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const icons = new IntersectionObserver(
      entries => entries.forEach(entry => entry.target.classList.toggle('is-live', entry.isIntersecting)),
      { rootMargin: '64px' },
    );

    const watch = (scope: ParentNode) => {
      if (revealing) {
        scope.querySelectorAll<HTMLElement>(SELECTOR).forEach(element => {
          if (!element.classList.contains('is-in')) io.observe(element);
        });
      }
      scope.querySelectorAll(ICON_SELECTOR).forEach(icon => icons.observe(icon));
    };
    watch(document);

    const mo = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (revealing && node.matches(SELECTOR) && !node.classList.contains('is-in')) io.observe(node);
          if (node.matches(ICON_SELECTOR)) icons.observe(node);
          watch(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      icons.disconnect();
      mo.disconnect();
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
