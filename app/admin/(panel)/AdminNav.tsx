'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Enquiries', match: (path: string) => path === '/admin' || path.startsWith('/admin/enquiries') },
  { href: '/admin/portfolio', label: 'Portfolio', match: (path: string) => path.startsWith('/admin/portfolio') },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin">
      {links.map(link => (
        <Link key={link.href} href={link.href} aria-current={link.match(pathname) ? 'page' : undefined}>{link.label}</Link>
      ))}
    </nav>
  );
}
