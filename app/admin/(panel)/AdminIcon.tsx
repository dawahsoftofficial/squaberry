import { Bell, BriefcaseBusiness, ChevronDown, ChevronRight, ExternalLink, Inbox, LogOut, User, type LucideIcon } from 'lucide-react';

// Admin icons, also from Lucide.
const icons = {
  inbox: Inbox,
  portfolio: BriefcaseBusiness,
  external: ExternalLink,
  bell: Bell,
  user: User,
  down: ChevronDown,
  right: ChevronRight,
  logout: LogOut,
} satisfies Record<string, LucideIcon>;

export default function AdminIcon({ name }: { name: keyof typeof icons }) {
  const Glyph = icons[name];
  return <Glyph className="admin-icon" size={20} strokeWidth={1.6} aria-hidden="true" focusable="false" />;
}
