import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

type Props = {
  page: 'terms' | 'privacy';
  eyebrow: string;
  title: string;
  lead: string;
  sections: { id: string; label: string }[];
  children: React.ReactNode;
};

/** Shared shell for the terms and privacy pages: hero, sticky in-page nav and the article. */
export default function LegalPage({ page, eyebrow, title, lead, sections, children }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="legal-hero">
          <div className="wrap">
            <p className="mono">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{lead}</p>
          </div>
        </section>
        <div className="wrap legal-layout">
          <nav className="legal-nav" aria-label="On this page">
            {sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
          </nav>
          <article className="legal-content">{children}</article>
        </div>
      </main>
      <SiteFooter current={page} />
    </>
  );
}
