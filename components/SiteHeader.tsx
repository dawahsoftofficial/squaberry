'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Icon from './Icon';
import { services, serviceStyle } from '@/lib/services';

const links = [
  { href: '/work', label: 'Projects' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Mega-menu copy: a short subtitle per featured service, with one highlighted word.
const featureCopy: Record<string, [string, string]> = {
  'web-app-development': ['Seamless', 'sites, apps & software'],
  'design-digital-experiences': ['Memorable', 'brands & interfaces'],
  'digital-marketing': ['Revenue-driven', 'campaigns'],
  'it-support-security': ['Reliable', 'support, kept secure'],
  'cloud-infrastructure': ['Solid', 'foundations to grow on'],
  'ai-workflow-automation': ['Less', 'busywork, more done'],
  'strategy-consulting': ['Clear', 'plans, sensible steps'],
};

// "All services" list: specific offers, each linking to the service that covers it.
const offers: { label: string; slug: string }[] = [
  { label: 'Websites', slug: 'web-app-development' },
  { label: 'E-commerce', slug: 'web-app-development' },
  { label: 'Web applications', slug: 'web-app-development' },
  { label: 'Brand identity', slug: 'design-digital-experiences' },
  { label: 'UI & UX design', slug: 'design-digital-experiences' },
  { label: 'SEO', slug: 'digital-marketing' },
  { label: 'Paid search & social', slug: 'digital-marketing' },
  { label: 'Content & email', slug: 'digital-marketing' },
  { label: 'IT support', slug: 'it-support-security' },
  { label: 'Cybersecurity', slug: 'it-support-security' },
  { label: 'Cloud hosting', slug: 'cloud-infrastructure' },
  { label: 'Automation', slug: 'ai-workflow-automation' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLButtonElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const visibleSlugs = new Set(services.map(service => service.slug));
  const visibleOffers = offers.filter(offer => visibleSlugs.has(offer.slug));
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close both menus on navigation.
  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  // ---- Services mega menu (desktop) ----
  const openMega = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  }, []);
  const closeMegaSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 180);
  }, []);
  const closeMega = useCallback((returnFocus = false) => {
    window.clearTimeout(closeTimer.current);
    setMega(false);
    if (returnFocus) servicesRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mega) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeMega(true);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!megaRef.current?.contains(target) && !servicesRef.current?.contains(target)) closeMega();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [mega, closeMega]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // The mega menu only exists on wide screens: close it if the window narrows to the phone layout.
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 960px)');
    const onChange = () => narrow.matches && setMega(false);
    narrow.addEventListener('change', onChange);
    return () => narrow.removeEventListener('change', onChange);
  }, []);

  const onServicesKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMega();
      window.setTimeout(() => megaRef.current?.querySelector<HTMLElement>('a')?.focus(), 30);
    }
  };
  const onServicesClick = () => {
    if (mega) return closeMega();
    openMega();
  };
  // Leaving the panel by keyboard closes it.
  const onMegaBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !megaRef.current?.contains(next) && next !== servicesRef.current) closeMega();
  };

  // ---- Full-screen menu (phones and tablets) ----
  useEffect(() => {
    if (!open) return;
    const lenis = window.squaberryLenis;
    lenis?.stop();
    document.documentElement.classList.add('menu-open');
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.documentElement.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}${mega ? ' is-mega' : ''}`} onPointerLeave={event => event.pointerType === 'mouse' && mega && closeMegaSoon()}>
      <div className="dock">
        <Link href="/" className="brand" aria-label="Squaberry home" onPointerEnter={() => mega && closeMegaSoon()}>
          <img src="/assets/squaberry-logo.svg" alt="Squaberry" width={152} height={50} />
        </Link>
        <span className="dock-divider" aria-hidden="true" />

        <nav className="dock-nav" aria-label="Main navigation">
          <button
            ref={servicesRef}
            type="button"
            className={`dock-link${isCurrent('/services') ? ' is-current' : ''}`}
            aria-expanded={mega}
            aria-controls="services-menu"
            onClick={onServicesClick}
            onKeyDown={onServicesKey}
            onPointerEnter={event => event.pointerType === 'mouse' && openMega()}
          >
            Services
            <Icon name="chevron-down" size={16} className="dock-chevron" />
          </button>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="dock-link"
              aria-current={isCurrent(link.href) ? 'page' : undefined}
              onPointerEnter={() => mega && closeMegaSoon()}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a href="mailto:hello@squaberry.co.uk" className="dock-mail" onPointerEnter={() => mega && closeMegaSoon()}>hello@squaberry.co.uk</a>
        <Link href="/contact#enquiry" className="btn is-accent header-cta" onPointerEnter={() => mega && closeMegaSoon()}>
          <span>Start a project</span>
          <span className="btn-icon"><Icon name="arrow-up-right" size={18} /></span>
        </Link>

        <button
          ref={buttonRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => {
            setMega(false);
            setOpen(value => !value);
          }}
        >
          <span>{open ? 'Close' : 'Menu'}</span>
          <Icon name={open ? 'close' : 'menu'} size={20} />
        </button>
      </div>

      {/* The dim layer is inside the header, so leaving the panel onto it doesn't fire the header's pointerleave. */}
      <div className="nav-scrim" aria-hidden="true" onPointerEnter={event => event.pointerType === 'mouse' && mega && closeMegaSoon()} />

      <div
        ref={megaRef}
        id="services-menu"
        className="mega"
        role="region"
        aria-label="Services"
        inert={!mega}
        onPointerEnter={event => event.pointerType === 'mouse' && openMega()}
        onBlur={onMegaBlur}
      >
        <div className="mega-grid">
          <div className="mega-col">
            <p className="mega-label">Services</p>
            <ul className="mega-features">
              {services.map(service => {
                const [highlight, rest] = featureCopy[service.slug] ?? ['', service.summary];
                const style = serviceStyle[service.slug];
                return (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className="mega-feature" style={{ ['--accent' as string]: style.accent }}>
                      <span className="mega-feature-icon"><Icon name={style.icon} size={22} /></span>
                      <span className="mega-feature-text">
                        <span className="mega-feature-title">{service.name}</span>
                        <span className="mega-feature-sub"><em>{highlight}</em> {rest}</span>
                      </span>
                      <Icon name="arrow-right" size={18} className="mega-feature-go" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mega-col">
            <p className="mega-label">Popular</p>
            <ul className="mega-offers" style={{ gridTemplateRows: `repeat(${Math.ceil(visibleOffers.length / 2)}, auto)` }}>
              {visibleOffers.map(offer => (
                <li key={offer.label}><Link href={`/services/${offer.slug}`}>{offer.label}</Link></li>
              ))}
            </ul>
            <Link href="/services" className="mega-all">All services <Icon name="arrow-right" size={16} /></Link>
          </div>

          <Link href="/work/muntada-aid" className="mega-work">
            <span className="mega-work-media">
              <img src="/assets/portfolio/muntada-aid.png" alt="" width={1168} height={880} loading="lazy" />
              <span className="mega-work-label">Case study</span>
            </span>
            <span className="mega-work-title">Muntada Aid</span>
            <span className="mega-work-text">A giving platform that turns urgent appeals into donations.</span>
          </Link>
        </div>

        <div className="mega-foot">
          <p>Not sure which service fits? Tell us the problem and we’ll suggest the right mix.</p>
          <Link href="/contact#enquiry" className="text-link">Start a conversation <Icon name="arrow-right" size={16} /></Link>
        </div>
      </div>

      <div className="mobile-menu" id="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile navigation">
          <ul>
            <li><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link></li>
            <li>
              <Link href="/services" aria-current={pathname === '/services' ? 'page' : undefined}>Services</Link>
              <ul className="mobile-sub">
                {services.map(service => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} aria-current={pathname === `/services/${service.slug}` ? 'page' : undefined} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                      <Icon name={serviceStyle[service.slug].icon} size={20} />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {links.map(link => (
              <li key={link.href}>
                <Link href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-foot">
          <Link href="/contact#enquiry" className="btn is-accent">
            <span>Start a project</span>
            <span className="btn-icon"><Icon name="arrow-up-right" size={18} /></span>
          </Link>
          <a href="mailto:hello@squaberry.co.uk" className="text-link">hello@squaberry.co.uk</a>
        </div>
      </div>
    </header>
  );
}
