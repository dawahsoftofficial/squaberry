import type { ReactNode } from 'react';

type Props = {
  /** Short eyebrow label above the title (may contain a link, e.g. a breadcrumb). */
  label: ReactNode;
  title: ReactNode;
  titleId?: string;
  lead?: ReactNode;
  /** Extra content on the right, under the lead: stats, quick links… */
  aside?: ReactNode;
  /** Buttons and links, shown last on the right. */
  actions?: ReactNode;
};

/** Page opener: eyebrow and large title on the left, intro, extras and actions on the right (stacked on phones). */
export default function PageHero({ label, title, titleId = 'pageTitle', lead, aside, actions }: Props) {
  return (
    <section className="container split-hero" aria-labelledby={titleId}>
      <div className="split-hero-main">
        <span className="eyebrow rise">{label}</span>
        <h1 id={titleId} className="display-xl rise d1">{title}</h1>
      </div>
      <div className="split-hero-side rise d2">
        {lead && <p className="lead">{lead}</p>}
        {aside}
        {actions && <div className="hero-actions">{actions}</div>}
      </div>
    </section>
  );
}
