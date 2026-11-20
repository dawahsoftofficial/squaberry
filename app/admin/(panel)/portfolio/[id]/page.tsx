import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PortfolioForm from '../PortfolioForm';
import { removePortfolio } from '../../../actions';
import { requireAdmin } from '@/lib/auth';
import { getPortfolioItem } from '@/lib/data';

export const metadata: Metadata = { title: 'Edit project' };

type Props = { params: Promise<{ id: string }> };

export default async function EditPortfolioPage({ params }: Props) {
  await requireAdmin();
  const id = Number((await params).id);
  const item = Number.isInteger(id) && id > 0 ? await getPortfolioItem(id) : null;
  if (!item) notFound();

  return (
    <>
      <p className="admin-back"><Link href="/admin/portfolio">← Portfolio</Link></p>
      <div className="admin-head"><div><p className="mono">PORTFOLIO</p><h1>{item.title}</h1></div></div>
      <PortfolioForm item={item} />
      <details className="danger-zone">
        <summary>Delete this project</summary>
        <p>This permanently removes the project from the portfolio. It can’t be undone.</p>
        <form action={removePortfolio}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="admin-button is-danger">Delete permanently</button>
        </form>
      </details>
    </>
  );
}
