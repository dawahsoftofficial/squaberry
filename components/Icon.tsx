import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Check,
  ChevronDown,
  Cloud,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Palette,
  PencilRuler,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';

// Site icons come from Lucide (lucide-react). Call sites use these short names, so swapping an
// icon only means changing this map. Decorative by default: pass `label` to expose one.
const icons = {
  'arrow-up-right': ArrowUpRight,
  'arrow-right': ArrowRight,
  'arrow-down': ArrowDown,
  'chevron-down': ChevronDown,
  menu: Menu,
  close: X,
  check: Check,
  mail: Mail,
  chat: MessageCircle,
  // Services
  web: MonitorSmartphone,
  design: Palette,
  marketing: Megaphone,
  security: ShieldCheck,
  cloud: Cloud,
  automation: Workflow,
  strategy: Target,
  // How we work
  discover: Search,
  shape: PencilRuler,
  build: Blocks,
  evolve: TrendingUp,
} satisfies Record<string, LucideIcon>;

type Props = { name: keyof typeof icons | string; label?: string; className?: string; size?: number };

export default function Icon({ name, label, className, size = 24 }: Props) {
  const Glyph = (icons as Record<string, LucideIcon>)[name];
  if (!Glyph) return null;
  return (
    <Glyph
      className={className}
      size={size}
      strokeWidth={1.75}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    />
  );
}
