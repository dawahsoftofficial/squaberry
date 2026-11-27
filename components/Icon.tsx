import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Minus, Plus, X, type LucideIcon } from 'lucide-react';
import { brandIconVersion, brandIcons } from './brand-icons';

// Brand and content icons are Squaberry's own hand-drawn set: drawn in scripts/build-icons.mjs and
// served as one sprite (public/icons.svg). They take the text colour; carved details use
// --icon-ink (set it to the tile's background). Lucide only supplies the small utility glyphs.
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

export default function Icon({ name, label, className, size = 24 }: Props) {
  const a11y = { role: label ? 'img' : undefined, 'aria-label': label, 'aria-hidden': label ? undefined : true, focusable: 'false' as const };
  if (brandIcons.has(name)) {
    return (
      <svg className={className ? `brand-icon ${className}` : 'brand-icon'} width={size} height={size} viewBox="0 0 24 24" {...a11y}>
        <use href={`/icons.svg?v=${brandIconVersion}#${name}`} />
      </svg>
    );
  }
  const Glyph = (utility as Record<string, LucideIcon>)[name];
  return Glyph ? <Glyph className={className} size={size} strokeWidth={1.75} {...a11y} /> : null;
}
