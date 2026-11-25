type Props = {
  label: string;
  title: React.ReactNode;
  id?: string;
  /** Optional paragraph shown beside (desktop) or under (mobile) the heading. */
  children?: React.ReactNode;
  /** Use on light panels (lavender, cream) for dark text and lines. */
  tone?: 'dark' | 'light';
  as?: 'h1' | 'h2';
};

/** Section opener: a small eyebrow label (lime square + text), then a large heading, with optional text beside it. */
export default function SectionIntro({ label, title, id, children, tone = 'dark', as: Heading = 'h2' }: Props) {
  return (
    <div className={`intro${tone === 'light' ? ' on-light' : ''}${children ? ' has-text' : ''}`}>
      <div className="intro-head reveal">
        <span className="eyebrow">{label}</span>
        <Heading id={id} className="display-l">{title}</Heading>
      </div>
      {children && <div className="intro-text reveal">{children}</div>}
    </div>
  );
}
