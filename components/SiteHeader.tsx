'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Icon from './Icon';
import { mediaUrl } from '@/lib/media-url';
import { products } from '@/lib/products';
import { services, serviceStyle } from '@/lib/services';

const links = [
  { href: '/work', label: 'Our Work' },
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

// The product shown as a card in the Products panel (the newest one).
const spotlight = products.find(product => product.slug === 'amanah-ai') ?? products[0];

type Menu = 'services' | 'products';
const menus: Menu[] = ['services', 'products'];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<Menu | null>(null);
  const mega = menu !== null;
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Record<Menu, HTMLButtonElement | null>>({ services: null, products: null });
  const panelRefs = useRef<Record<Menu, HTMLDivElement | null>>({ services: null, products: null });
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
    setMenu(null);
  }, [pathname]);

  // ---- Services and Products mega menus (desktop) ----
  const openMega = useCallback((which: Menu) => {
    window.clearTimeout(closeTimer.current);
    setMenu(which);
  }, []);
  const closeMegaSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 180);
  }, []);
  const closeMega = useCallback((returnFocus?: Menu) => {
    window.clearTimeout(closeTimer.current);
    setMenu(null);
    if (returnFocus) triggerRefs.current[returnFocus]?.focus();
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeMega(menu);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      const inside = menus.some(which => panelRefs.current[which]?.contains(target) || triggerRefs.current[which]?.contains(target));
      if (!inside) closeMega();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menu, closeMega]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // The mega menu only exists on wide screens: close it if the window narrows to the phone layout.
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 960px)');
    const onChange = () => narrow.matches && setMenu(null);
    narrow.addEventListener('change', onChange);
    return () => narrow.removeEventListener('change', onChange);
  }, []);

  // Each dropdown: a button in the dock and a panel under it (one open at a time).
  const trigger = (which: Menu, label: string, href: string) => (
    <button
      ref={node => { triggerRefs.current[which] = node; }}
      type="button"
      className={`dock-link${isCurrent(href) ? ' is-current' : ''}`}
      aria-expanded={menu === which}
      aria-controls={`${which}-menu`}
      onClick={() => (menu === which ? closeMega() : openMega(which))}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        openMega(which);
        window.setTimeout(() => panelRefs.current[which]?.querySelector<HTMLElement>('a')?.focus(), 30);
      }}
      onPointerEnter={event => event.pointerType === 'mouse' && openMega(which)}
    >
      {label}
      <Icon name="chevron-down" size={16} className="dock-chevron" />
    </button>
  );
  const panelProps = (which: Menu, label: string) => ({
    ref: (node: HTMLDivElement | null) => { panelRefs.current[which] = node; },
    id: `${which}-menu`,
    className: `mega${menu === which ? ' is-open' : ''}`,
    role: 'region',
    'aria-label': label,
    inert: menu !== which,
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => { if (event.pointerType === 'mouse') openMega(which); },
    // Leaving the panel by keyboard closes it.
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && !panelRefs.current[which]?.contains(next) && next !== triggerRefs.current[which]) closeMega();
    },
  });

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
          <img src={mediaUrl('/assets/squaberry-logo-tonal.svg')} alt="Squaberry" width={137} height={32} />
        </Link>
        <span className="dock-divider" aria-hidden="true" />

        <nav className="dock-nav" aria-label="Main navigation">
          {trigger('services', 'Services', '/services')}
          {trigger('products', 'Products', '/products')}
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
            setMenu(null);
            setOpen(value => !value);
          }}
        >
          <span>{open ? 'Close' : 'Menu'}</span>
          <Icon name={open ? 'close' : 'menu'} size={20} />
        </button>
      </div>

      {/* The dim layer is inside the header, so leaving the panel onto it doesn't fire the header's pointerleave. */}
      <div className="nav-scrim" aria-hidden="true" onPointerEnter={event => event.pointerType === 'mouse' && mega && closeMegaSoon()} />

      <div {...panelProps('services', 'Services')}>
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
                      <span className="mega-feature-icon"><Icon name={style.icon} size={34} /></span>
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
              <Image src="/assets/portfolio/muntada-aid.png" alt="" width={1168} height={880} sizes="340px" />
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

      <div {...panelProps('products', 'Products')}>
        <div className="mega-grid is-products">
          <div className="mega-col">
            <p className="mega-label">Products</p>
            <ul className="mega-features is-two">
              {products.map(product => (
                <li key={product.slug}>
                  <Link href={`/products/${product.slug}`} className="mega-feature" style={{ ['--accent' as string]: product.accent }}>
                    <span className="mega-feature-icon"><Icon name={product.icon} size={34} /></span>
                    <span className="mega-feature-text">
                      <span className="mega-feature-title">{product.name}</span>
                      <span className="mega-feature-sub">{product.category}</span>
                    </span>
                    <Icon name="arrow-right" size={18} className="mega-feature-go" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="mega-feature">
                  <span className="mega-feature-icon"><Icon name="grid" size={34} /></span>
                  <span className="mega-feature-text">
                    <span className="mega-feature-title">All products</span>
                    <span className="mega-feature-sub">Compare them side by side</span>
                  </span>
                  <Icon name="arrow-right" size={18} className="mega-feature-go" />
                </Link>
              </li>
            </ul>
          </div>

          <Link href={`/products/${spotlight.slug}`} className="mega-work">
            <span className="mega-work-media">
              <Image src={spotlight.cover.src} alt="" width={1200} height={900} sizes="340px" />
              <span className="mega-work-label">New</span>
            </span>
            <span className="mega-work-title">{spotlight.name}</span>
            <span className="mega-work-text">{spotlight.headline}.</span>
          </Link>
        </div>

        <div className="mega-foot">
          <p>Ready-made software, set up in your brand. Book a demo to see one working.</p>
          <Link href="/products" className="text-link">Browse products <Icon name="arrow-right" size={16} /></Link>
        </div>
      </div>

      <div className="mobile-menu" id="mobile-menu" hidden={!open} data-lenis-prevent>
        <nav aria-label="Mobile navigation">
          <ul>
            <li><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link></li>
            <li>
              <Link href="/services" aria-current={pathname === '/services' ? 'page' : undefined}>Services</Link>
              <ul className="mobile-sub">
                {services.map(service => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} aria-current={pathname === `/services/${service.slug}` ? 'page' : undefined} style={{ ['--accent' as string]: serviceStyle[service.slug].accent }}>
                      <Icon name={serviceStyle[service.slug].icon} size={24} />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href="/products" aria-current={pathname === '/products' ? 'page' : undefined}>Products</Link>
              <ul className="mobile-sub">
                {products.map(product => (
                  <li key={product.slug}>
                    <Link href={`/products/${product.slug}`} aria-current={pathname === `/products/${product.slug}` ? 'page' : undefined} style={{ ['--accent' as string]: product.accent }}>
                      <Icon name={product.icon} size={24} />
                      {product.name}
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
