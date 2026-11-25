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
      <section className="container page-hero" aria-labelledby="pageTitle">
        <span className="pill rise">{eyebrow}</span>
        <h1 id="pageTitle" className="display-xl rise d1">{title}</h1>
        <p className="lead rise d2">{lead}</p>
      </section>
      <div className="container legal-layout">
        <nav className="legal-nav" aria-label="On this page">
          {sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
        </nav>
        <article className="legal-content">{children}</article>
      </div>
    </main>
  );
}
