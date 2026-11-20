'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Props = {
  /** Homepage uses in-page anchors; every other page links back to the homepage sections. */
  home?: boolean;
  /** Marks the matching nav link with aria-current. */
  current?: 'about' | 'contact';
  /** On the contact page the "Let's talk" call to action opens email instead. */
  ctaHref?: string;
};

export default function SiteHeader({ home = false, current, ctaHref = '/contact' }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefix = home ? '' : '/';

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="header">
      <div className="wrap header-inner">
        <Link href="/" aria-label="Squaberry home">
          <img className="logo" src="/assets/squaberry-logo.svg" alt="Squaberry" />
        </Link>
        <button
          ref={buttonRef}
          className="menu-button"
          id="menuButton"
          type="button"
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(value => !value)}
        >
          MENU <b aria-hidden="true">{open ? '−' : '+'}</b>
        </button>
        <nav className={`nav${open ? ' is-open' : ''}`} id="navigation" aria-label="Main navigation">
          <a href={`${prefix}#services`} onClick={close}>What we do</a>
          <Link href="/about" onClick={close} aria-current={current === 'about' ? 'page' : undefined}>About us</Link>
          <a href={`${prefix}#about`} onClick={close}>Our DNA</a>
          <a href={`${prefix}#process`} onClick={close}>How we work</a>
          <Link href="/contact" onClick={close} aria-current={current === 'contact' ? 'page' : undefined}>Contact</Link>
          <a href={ctaHref} className="nav-cta" onClick={close}>
            Let’s talk <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
