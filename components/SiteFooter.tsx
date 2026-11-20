import Link from 'next/link';

type Props = {
  current?: 'contact' | 'terms' | 'privacy';
  /** The homepage ends with "Back to top"; other pages link home. */
  home?: boolean;
};

export default function SiteFooter({ current, home = false }: Props) {
  const mark = (page: Props['current']) => (current === page ? 'page' : undefined);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <Link href="/" aria-label="Squaberry home">
            <img className="footer-logo" src="/assets/squaberry-logo.svg" alt="Squaberry" />
          </Link>
          <p className="footer-caption">A little square.<br />A lot of possibility.</p>
        </div>
        <div className="footer-bottom">
          <span className="mono">© {new Date().getFullYear()} SQUABERRY.CO.UK</span>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/contact" aria-current={mark('contact')}>Contact</Link>
            <Link href="/terms" aria-current={mark('terms')}>Terms</Link>
            <Link href="/privacy" aria-current={mark('privacy')}>Privacy</Link>
            {home ? <a href="#top">Back to top ↑</a> : <Link href="/">Home</Link>}
          </nav>
        </div>
      </div>
    </footer>
  );
}
