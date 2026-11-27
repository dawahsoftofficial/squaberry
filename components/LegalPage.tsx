import JsonLd from './JsonLd';
import PageHero from './PageHero';
import { breadcrumbSchema } from '@/lib/schema';

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  sections: { id: string; label: string }[];
  /** Breadcrumb entry for this page, e.g. { name: 'Privacy policy', path: '/privacy' }. */
  crumb: { name: string; path: string };
  children: React.ReactNode;
};

/** Shared shell for the terms and privacy pages: hero, sticky in-page nav and the article. */
export default function LegalPage({ eyebrow, title, lead, sections, crumb, children }: Props) {
  return (
    <main id="main">
      <JsonLd data={breadcrumbSchema([crumb])} />
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
