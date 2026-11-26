import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { removeEnquiry, updateEnquiryStatus } from '../../../actions';
import { formatDate } from '../../format';
import { requireAdmin } from '@/lib/auth';
import { getEnquiry, type EnquiryStatus } from '@/lib/data';
import { getProduct } from '@/lib/products';

export const metadata: Metadata = { title: 'Enquiry' };

type Props = { params: Promise<{ id: string }> };

function StatusButton({ id, status, label, primary }: { id: number; status: EnquiryStatus; label: string; primary?: boolean }) {
  return (
    <form action={updateEnquiryStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={primary ? 'button' : 'admin-button'}>{label}</button>
    </form>
  );
}

export default async function EnquiryPage({ params }: Props) {
  await requireAdmin();
  const id = Number((await params).id);
  const enquiry = Number.isInteger(id) && id > 0 ? await getEnquiry(id) : null;
  if (!enquiry) notFound();

  const product = enquiry.product ? getProduct(enquiry.product)?.name ?? enquiry.product : null;
  const replySubject = encodeURIComponent(product
    ? `Re: ${product} (Squaberry)`
    : `Re: your enquiry to Squaberry${enquiry.topic ? ` (${enquiry.topic})` : ''}`);

  return (
    <>
      <p className="admin-back"><Link href="/admin">← All enquiries</Link></p>
      <div className="admin-head">
        <div>
          <p className="mono">{product ? 'PRODUCT ENQUIRY' : 'ENQUIRY'} #{enquiry.id} · <span className={`status-badge is-${enquiry.status}`}>{enquiry.status}</span></p>
          <h1>{enquiry.name}</h1>
        </div>
      </div>

      <div className="enquiry-detail">
        <article className="enquiry-message">
          <h2 className="mono">MESSAGE</h2>
          <p>{enquiry.message || 'No message added.'}</p>
        </article>
        <aside className="enquiry-meta">
          <dl>
            {product && <div><dt>Product</dt><dd><span className="product-badge">{product}</span></dd></div>}
            <div><dt>Email</dt><dd><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></dd></div>
            {enquiry.phone && <div><dt>Phone</dt><dd><a href={`tel:${enquiry.phone.replace(/[^\d+]/g, '')}`}>{enquiry.phone}</a></dd></div>}
            <div><dt>{product ? 'Business' : 'Company'}</dt><dd>{enquiry.company || '—'}</dd></div>
            <div><dt>{product ? 'Wants to' : 'Topic'}</dt><dd>{enquiry.topic || '—'}</dd></div>
            <div><dt>Sent from</dt><dd>{enquiry.source_page || '—'}</dd></div>
            <div><dt>Received</dt><dd><time dateTime={new Date(enquiry.created_at).toISOString()}>{formatDate(enquiry.created_at)}</time></dd></div>
          </dl>
          <div className="enquiry-actions">
            <a className="button" href={`mailto:${enquiry.email}?subject=${replySubject}`}>Reply by email <span className="arrow" aria-hidden="true">↗</span></a>
            {enquiry.status === 'new' && <StatusButton id={enquiry.id} status="read" label="Mark as read" />}
            {enquiry.status === 'read' && <StatusButton id={enquiry.id} status="new" label="Mark as new" />}
            {enquiry.status === 'archived'
              ? <StatusButton id={enquiry.id} status="read" label="Move to inbox" />
              : <StatusButton id={enquiry.id} status="archived" label="Archive" />}
          </div>
          <details className="danger-zone">
            <summary>Delete this enquiry</summary>
            <p>This permanently removes the enquiry. It can’t be undone.</p>
            <form action={removeEnquiry}>
              <input type="hidden" name="id" value={enquiry.id} />
              <button type="submit" className="admin-button is-danger">Delete permanently</button>
            </form>
          </details>
        </aside>
      </div>
    </>
  );
}
