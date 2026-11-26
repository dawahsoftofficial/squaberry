'use client';

import { useEffect } from 'react';

const SELECTOR = '.reveal, .tilt-in, .text-reveal';
const STEP_MS = 90;
const MAX_STEPS = 6;

/**
 * Scroll reveals for every browser. The inline script in the root layout adds `js-reveal` to <html>
 * (unless reduced motion is on), which hides revealable elements; this observer adds `is-in` as each
 * one enters the viewport, staggering elements that arrive together, then `is-done` so the element's
 * own hover transitions take over. New elements (route changes, filters) are picked up automatically.
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    if (!root.classList.contains('js-reveal')) return;

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

    const watch = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>(SELECTOR).forEach(element => {
        if (!element.classList.contains('is-in')) io.observe(element);
      });
    };
    watch(document);

    const mo = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(SELECTOR) && !node.classList.contains('is-in')) io.observe(node);
          watch(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
