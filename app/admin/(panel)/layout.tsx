import type { Metadata } from 'next';
import Link from 'next/link';
import '../admin.css';
import { logout } from '../actions';
import AdminNav from './AdminNav';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Squaberry admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <Link href="/admin" className="admin-brand" aria-label="Squaberry admin home">
            <img src="/assets/squaberry-logo.svg" alt="Squaberry" />
            <span className="mono">ADMIN</span>
          </Link>
          <AdminNav />
          <div className="admin-bar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer">View site <span aria-hidden="true">↗</span></a>
            <form action={logout}><button type="submit">Log out</button></form>
          </div>
        </div>
      </header>
      <main id="main" className="admin-main">{children}</main>
    </div>
  );
}
