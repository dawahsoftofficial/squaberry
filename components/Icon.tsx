import { useId, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Minus, Plus, X, type LucideIcon } from 'lucide-react';
import { brandIconVersion, brandIcons } from './brand-icons';

// Brand and content icons are Squaberry's own hand-drawn set: drawn in scripts/build-icons.mjs and
// served as one sprite (public/icons.svg). They take the text colour; carved details use
// --icon-ink (set it to the tile's background). Lucide only supplies the small utility glyphs.
// Each one has two hand-drawn frames (`name` and `name-b`) that globals.css flicks between, a
// two-frame "line boil"; useId gives every icon its own start point so they don't flick in sync.
// Decorative by default: pass `label` to expose one.
const utility = {
  'arrow-up-right': ArrowUpRight,
  'arrow-right': ArrowRight,
  'arrow-down': ArrowDown,
  'chevron-down': ChevronDown,
  menu: Menu,
  close: X,
  check: Check,
  plus: Plus,
  minus: Minus,
} satisfies Record<string, LucideIcon>;

type Props = { name: string; label?: string; className?: string; size?: number };

// A stable spread of start offsets across the 0.8s boil cycle (same on server and client).
function boilDelay(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return `${-((h >>> 0) % 16) * 0.05}s`;
}

export default function Icon({ name, label, className, size = 24 }: Props) {
  const id = useId();
  const a11y = { role: label ? 'img' : undefined, 'aria-label': label, 'aria-hidden': label ? undefined : true, focusable: 'false' as const };
  if (brandIcons.has(name)) {
    return (
      <svg className={className ? `brand-icon ${className}` : 'brand-icon'} width={size} height={size} viewBox="0 0 24 24"
        style={{ '--boil-delay': boilDelay(name + id) } as CSSProperties} {...a11y}>
        <use className="boil-a" href={`/icons.svg?v=${brandIconVersion}#${name}`} />
        <use className="boil-b" href={`/icons.svg?v=${brandIconVersion}#${name}-b`} />
      </svg>
    );
  }
  const Glyph = (utility as Record<string, LucideIcon>)[name];
  return Glyph ? <Glyph className={className} size={size} strokeWidth={1.75} {...a11y} /> : null;
}
