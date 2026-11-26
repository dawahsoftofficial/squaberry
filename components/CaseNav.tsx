'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';

type Section = { id: string; label: string };

/**
 * Project page sidebar navigation: a reading-progress bar for the article and an
 * "On this page" list that highlights the section in view and scrolls smoothly (via Lenis) on click.
 */
export default function CaseNav({ sections, articleId }: { sections: Section[]; articleId: string }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const barRef = useRef<HTMLSpanElement>(null);

  // Highlight the section crossing the upper middle of the screen.
  useEffect(() => {
    const targets = sections.map(section => document.getElementById(section.id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length) setActive(visible[visible.length - 1].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  // Reading progress through the article, written straight to the bar (no re-render per scroll).
  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - rect.top) / Math.max(total, 1)));
      barRef.current?.style.setProperty('--progress', progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [articleId]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    const lenis = window.squaberryLenis;
    if (!target || !lenis) return; // fall back to the browser's own jump
    event.preventDefault();
    lenis.scrollTo(target, { offset: -110 });
    history.replaceState(null, '', `#${id}`);
    setActive(id);
  };

  return (
    <nav className="case-nav" aria-label="On this page">
      <span className="case-progress" aria-hidden="true"><span ref={barRef} /></span>
      <p className="case-side-label">On this page</p>
      <ol>
        {sections.map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={event => go(event, section.id)}>
              <span className="case-nav-num">{String(index + 1).padStart(2, '0')}</span>
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
