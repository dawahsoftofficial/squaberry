import type { Metadata } from 'next';
import '../admin-base.css';
import '../admin.css';
import { AdminHeader, AdminSidebar } from './AdminNavigation';
import { requireAdmin } from '@/lib/auth';
import { countEnquiries } from '@/lib/data';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Squaberry admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const counts = await countEnquiries().catch(() => null);
  return (
    <div className="admin">
      <AdminHeader newEnquiries={counts?.new ?? null} />
      <AdminSidebar />
      <main id="main" className="admin-main">{children}</main>
    </div>
  );
}
