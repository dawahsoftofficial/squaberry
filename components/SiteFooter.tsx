import Link from 'next/link';
import Icon from './Icon';
import { services } from '@/lib/services';

const talk = ['web', 'design', 'marketing', 'SEO', 'apps', 'IT'];

function TalkRow({ reverse = false }: { reverse?: boolean }) {
  const words = reverse ? [...talk].reverse() : talk;
  const group = (hidden: boolean) => (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {words.map(word => (
        <span className="talk-item" key={word}>
          Let’s talk {word}
          <Icon name="chat" className="talk-icon" size={56} />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee talk-marquee${reverse ? ' is-reverse' : ''}`}>
      <div className="marquee-track">{group(false)}{group(true)}</div>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/contact#enquiry" className="talk-link" aria-label="Let’s talk: start a project">
        <span aria-hidden="true">
          <TalkRow />
          <TalkRow reverse />
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
