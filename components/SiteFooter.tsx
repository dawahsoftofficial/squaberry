import Link from 'next/link';
import Icon from './Icon';
import { services } from '@/lib/services';

// Two rows of soft-square tiles sliding in opposite directions: what we do, with a few brand tiles.
type Tile = { label: string; icon: string; accent?: string; tone?: 'lime' | 'lav' };
const offerTiles: Tile[] = [
  { label: 'Websites', icon: 'web', accent: '#b3a8ff' },
  { label: 'Web apps', icon: 'apps', accent: '#8fd3e8' },
  { label: 'Start a project', icon: 'arrow-up-right', tone: 'lime' },
  { label: 'E-commerce', icon: 'shop', accent: '#ffb38a' },
  { label: 'Branding', icon: 'design', accent: '#f5a8d4' },
  { label: 'UI & UX', icon: 'ui', accent: '#ecff95' },
  { label: 'IT support', icon: 'support', accent: '#9fe6b8' },
];
const brandTiles: Tile[] = [
  { label: 'SEO', icon: 'seo', accent: '#ecff95' },
  { label: 'Fresh ideas', icon: 'sparkle', tone: 'lav' },
  { label: 'Paid social', icon: 'marketing', accent: '#f5a8d4' },
  { label: 'Content & email', icon: 'content', accent: '#8fd3e8' },
  { label: 'Solid tech', icon: 'bolt', tone: 'lime' },
  { label: 'Cybersecurity', icon: 'security', accent: '#9fe6b8' },
  { label: 'Cloud hosting', icon: 'cloud', accent: '#b3a8ff' },
];

function TileRow({ tiles, reverse = false }: { tiles: Tile[]; reverse?: boolean }) {
  const group = (hidden: boolean) => (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {[...tiles, ...tiles].map((tile, index) => (
        <span className={`strip-tile${tile.tone ? ` is-${tile.tone}` : ''}`} key={`${tile.label}-${index}`} style={tile.accent ? { ['--accent' as string]: tile.accent } : undefined}>
          <span className="strip-icon"><Icon name={tile.icon} size={22} /></span>
          {tile.label}
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee strip-row${reverse ? ' is-reverse' : ''}`}>
      <div className="marquee-track">{group(false)}{group(true)}</div>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/contact#enquiry" className="strip" aria-label="Start a project with Squaberry">
        <span className="strip-inner" aria-hidden="true">
          <TileRow tiles={offerTiles} />
          <TileRow tiles={brandTiles} reverse />
        </span>
      </Link>

      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/squaberry-logo.svg" alt="Squaberry" width={152} height={50} />
            <p>Fresh ideas and solid tech: design, development, marketing and IT, under one roof.</p>
          </div>
          <nav className="footer-col" aria-label="Footer: pages">
            <h2>Explore</h2>
            <ul>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/work">Projects</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
          <nav className="footer-col" aria-label="Footer: services">
            <h2>Services</h2>
            <ul>
              {services.map(service => <li key={service.slug}><Link href={`/services/${service.slug}`}>{service.name}</Link></li>)}
            </ul>
          </nav>
          <div className="footer-col">
            <h2>Say hello</h2>
            <ul>
              <li><a href="mailto:hello@squaberry.co.uk">hello@squaberry.co.uk</a></li>
              <li><Link href="/contact#enquiry">Start a project</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Squaberry. All rights reserved.</p>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
