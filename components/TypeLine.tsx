'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type Props = {
  /** Phrases to cycle through. The first is what the server renders and screen readers hear. */
  phrases: string[];
  /** How long a finished phrase stays before it is erased (ms). */
  hold?: number;
};

const TYPE_MS_PER_CHAR = 95;
const ERASE_MS_PER_CHAR = 50;
const GAP_MS = 340;
const TYPE_EASE = 'cubic-bezier(.3,.55,.35,1)';
const ERASE_EASE = 'cubic-bezier(.5,0,.5,1)';

/**
 * Typing headline line. Each phrase is written on and erased by a smooth, soft-edged reveal with the
 * caret gliding along it (no per-letter steps). Starts fully written, so it works without JS and doesn't
 * flash; pauses while off screen or in a background tab; stays static under reduced motion. The visible
 * text is aria-hidden, and assistive tech reads the first phrase once.
 */
export default function TypeLine({ phrases, hold = 3000 }: Props) {
  const [text, setText] = useState(phrases[0]);
  const [moving, setMoving] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const windowRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const win = windowRef.current;
    const inner = textRef.current;
    if (!root || !win || !inner || phrases.length < 2 || typeof win.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let index = 0;
    let timer = 0;
    let visible = true;
    let waiting = false; // a cycle is due but the line is off screen or the tab is hidden
    let stopped = false;
    let animation: Animation | null = null;

    const reveal = (from: number, to: number, duration: number, easing: string) =>
      new Promise<void>(resolve => {
        animation = win.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration, easing, fill: 'forwards' });
        animation.onfinish = () => resolve();
        animation.oncancel = () => resolve();
      });
    const pause = (ms: number) => new Promise<void>(resolve => { timer = window.setTimeout(resolve, ms); });

    async function cycle() {
      if (stopped) return;
      if (!visible || document.hidden) { waiting = true; return; }
      setMoving(true);
      await reveal(inner!.offsetWidth, 0, Math.max(520, phrases[index].length * ERASE_MS_PER_CHAR), ERASE_EASE);
      if (stopped) return;
      index = (index + 1) % phrases.length;
      flushSync(() => setText(phrases[index]));
      await pause(GAP_MS);
      if (stopped) return;
      await reveal(0, inner!.offsetWidth, Math.max(650, phrases[index].length * TYPE_MS_PER_CHAR), TYPE_EASE);
      if (stopped) return;
      animation?.cancel(); // back to the natural width, so it still fits if the font size changes
      setMoving(false);
      timer = window.setTimeout(cycle, hold);
    }

    const resume = () => {
      if (waiting && visible && !document.hidden) {
        waiting = false;
        timer = window.setTimeout(cycle, 700);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', resume);
    timer = window.setTimeout(cycle, hold);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      animation?.cancel();
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
    };
  }, [phrases, hold]);

  return (
    <span className={`type-line${moving ? ' is-moving' : ''}`} ref={rootRef}>
      <span className="visually-hidden">{phrases[0]}</span>
      <span className="type-window" ref={windowRef} aria-hidden="true">
        <span className="type-text" ref={textRef}>{text}</span>
      </span>
      <span className="type-caret" aria-hidden="true" />
    </span>
  );
}
