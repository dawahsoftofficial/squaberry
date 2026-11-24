import type { Metadata } from 'next';
import Link from 'next/link';
import AdminIcon from './AdminIcon';
import { formatDate } from './format';
import { requireAdmin } from '@/lib/auth';
import { countEnquiries, listEnquiries, type Enquiry, type EnquiryStatus } from '@/lib/data';

export const metadata: Metadata = { title: 'Enquiries' };

type Filter = EnquiryStatus | 'inbox' | 'all';
const filters: { value: Filter; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
];

type Props = { searchParams: Promise<{ status?: string; deleted?: string }> };

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('').toUpperCase();
}

export default async function EnquiriesPage({ searchParams }: Props) {
  await requireAdmin();
  const { status, deleted } = await searchParams;
  const filter: Filter = filters.some(item => item.value === status) ? (status as Filter) : 'inbox';

  let enquiries: Enquiry[] = [];
  let counts = { new: 0, read: 0, archived: 0, all: 0 };
  let failed = false;
  try {
    [enquiries, counts] = await Promise.all([listEnquiries(filter), countEnquiries()]);
  } catch (error) {
    failed = true;
    console.error('Admin enquiries could not be loaded:', error instanceof Error ? error.message : error);
  }
  const countFor = (value: Filter) => (value === 'inbox' ? counts.new + counts.read : counts[value]);

  return (
    <>
      <div className="admin-head inbox-head">
        <h1>Inbox</h1>
        <dl className="inbox-summary">
          <div><dt>New enquiries</dt><dd>{failed ? '—' : counts.new}</dd></div>
          <div><dt>Total enquiries</dt><dd>{failed ? '—' : counts.all}</dd></div>
        </dl>
      </div>

      {deleted && <p className="admin-flash" role="status">Enquiry deleted.</p>}
      {failed && <p className="admin-flash is-error" role="alert">The database couldn’t be reached. Check the DB_* settings and try again.</p>}

      <div className="inbox-card">
        <nav className="admin-tabs" aria-label="Filter enquiries">
          {filters.map(item => (
            <Link key={item.value} href={item.value === 'inbox' ? '/admin' : `/admin?status=${item.value}`} aria-current={filter === item.value ? 'page' : undefined}>
              {item.label} {!failed && <span>{countFor(item.value)}</span>}
            </Link>
          ))}
        </nav>

        {enquiries.length ? (
          <>
            <div className="enquiry-columns" aria-hidden="true">
              <span>Sender</span><span>Enquiry</span><span>Status</span><span>Received</span>
            </div>
            <ul className="enquiry-list">
              {enquiries.map(enquiry => (
                <li key={enquiry.id} className={`enquiry-row is-${enquiry.status}`}>
                  <Link href={`/admin/enquiries/${enquiry.id}`}>
                    <span className="enquiry-sender">
                      <span className="enquiry-avatar" aria-hidden="true">{initials(enquiry.name)}</span>
                      <span className="enquiry-who">
                        <strong>{enquiry.name}</strong>
                        <span>{enquiry.email}{enquiry.company ? ` · ${enquiry.company}` : ''}</span>
                      </span>
                    </span>
                    <span className="enquiry-excerpt">
                      {enquiry.topic && <strong>{enquiry.topic}</strong>}
                      <span>{enquiry.message.length > 140 ? `${enquiry.message.slice(0, 140)}…` : enquiry.message}</span>
                    </span>
                    <span className={`status-badge is-${enquiry.status}`}>{enquiry.status}</span>
                    <time dateTime={new Date(enquiry.created_at).toISOString()}>{formatDate(enquiry.created_at)}</time>
                    <AdminIcon name="right" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          !failed && <div className="admin-empty"><AdminIcon name="inbox" /><h2>Nothing here yet.</h2><p>New enquiries from the website appear in your inbox.</p></div>
        )}
      </div>
    </>
  );
}
