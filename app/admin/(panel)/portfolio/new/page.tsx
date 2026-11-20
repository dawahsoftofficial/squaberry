import type { Metadata } from 'next';
import Link from 'next/link';
import PortfolioForm from '../PortfolioForm';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Add a project' };

export default async function NewPortfolioPage() {
  await requireAdmin();
  return (
    <>
      <p className="admin-back"><Link href="/admin/portfolio">← Portfolio</Link></p>
      <div className="admin-head"><div><p className="mono">PORTFOLIO</p><h1>Add a project.</h1></div></div>
      <PortfolioForm />
    </>
  );
}
