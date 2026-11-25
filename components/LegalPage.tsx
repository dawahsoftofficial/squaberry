import PageHero from './PageHero';

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  sections: { id: string; label: string }[];
  children: React.ReactNode;
};

/** Shared shell for the terms and privacy pages: hero, sticky in-page nav and the article. */
export default function LegalPage({ eyebrow, title, lead, sections, children }: Props) {
  return (
    <main id="main">
      <PageHero label={eyebrow} title={title} lead={lead} />
      <div className="container legal-layout">
        <nav className="legal-nav" aria-label="On this page">
          {sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
        </nav>
        <article className="legal-content">{children}</article>
      </div>
    </main>
  );
}
