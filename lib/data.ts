import 'server-only';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { cache } from 'react';
import { db } from './db';

export type EnquiryStatus = 'new' | 'read' | 'archived';
export const enquiryStatuses: EnquiryStatus[] = ['new', 'read', 'archived'];

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  topic: string | null;
  message: string;
  source_page: string | null;
  /** Product slug (lib/products.ts) for product signups; null for project enquiries. */
  product: string | null;
  phone: string | null;
  status: EnquiryStatus;
  created_at: Date;
};

/** Project enquiries come from the general form; product enquiries from a product page's signup form. */
export type EnquiryKind = 'all' | 'project' | 'product';
const enquiryColumns = 'id, name, email, company, topic, message, source_page, product, phone, status, created_at';
const kindClause = (kind: EnquiryKind) => (kind === 'product' ? 'product IS NOT NULL' : kind === 'project' ? 'product IS NULL' : '');

export type PortfolioItem = {
  id: number;
  service_slug: string;
  title: string;
  client: string | null;
  summary: string | null;
  site_url: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  /** Case-study page fields (/work/[slug]). Long text fields hold paragraphs separated by blank lines. */
  slug: string | null;
  intro: string | null;
  scope: string | null;
  overview: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  /** One image per line: "path-or-url | alt text". */
  gallery: string | null;
  quote: string | null;
  quote_name: string | null;
  quote_role: string | null;
};

type Row<T> = T & RowDataPacket;

// --- Enquiries ------------------------------------------------------------------------------

export async function createEnquiry(input: Omit<Enquiry, 'id' | 'status' | 'created_at'>): Promise<number> {
  const [result] = await db().execute<ResultSetHeader>(
    'INSERT INTO enquiries (name, email, company, topic, message, source_page, product, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [input.name, input.email, input.company, input.topic, input.message, input.source_page, input.product, input.phone],
  );
  return result.insertId;
}

export async function listEnquiries(status: EnquiryStatus | 'inbox' | 'all', kind: EnquiryKind = 'all'): Promise<Enquiry[]> {
  const conditions = [
    status === 'all' ? '' : status === 'inbox' ? "status <> 'archived'" : 'status = ?',
    kindClause(kind),
  ].filter(Boolean);
  const params = status === 'all' || status === 'inbox' ? [] : [status];
  const [rows] = await db().execute<Row<Enquiry>[]>(
    `SELECT ${enquiryColumns} FROM enquiries ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC LIMIT 500`,
    params,
  );
  return rows;
}

export const countEnquiries = cache(async (kind: EnquiryKind = 'all'): Promise<Record<EnquiryStatus | 'all', number>> => {
  const where = kindClause(kind);
  const [rows] = await db().query<Row<{ status: EnquiryStatus; total: number }>[]>(
    `SELECT status, COUNT(*) AS total FROM enquiries ${where ? `WHERE ${where}` : ''} GROUP BY status`,
  );
  const counts = { new: 0, read: 0, archived: 0, all: 0 };
  for (const row of rows) {
    counts[row.status] = Number(row.total);
    counts.all += Number(row.total);
  }
  return counts;
});

export async function getEnquiry(id: number): Promise<Enquiry | null> {
  const [rows] = await db().execute<Row<Enquiry>[]>(
    `SELECT ${enquiryColumns} FROM enquiries WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function setEnquiryStatus(id: number, status: EnquiryStatus): Promise<void> {
  await db().execute('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
}

export async function deleteEnquiry(id: number): Promise<void> {
  await db().execute('DELETE FROM enquiries WHERE id = ?', [id]);
}

// --- Portfolio ------------------------------------------------------------------------------

const portfolioColumns =
  'id, service_slug, title, client, summary, site_url, image_url, sort_order, published, slug, intro, scope, overview, challenge, solution, results, gallery, quote, quote_name, quote_role';
const portfolioFields = [
  'service_slug', 'title', 'client', 'summary', 'site_url', 'image_url', 'sort_order', 'published',
  'slug', 'intro', 'scope', 'overview', 'challenge', 'solution', 'results', 'gallery', 'quote', 'quote_name', 'quote_role',
] as const;

function toItem(row: Row<PortfolioItem>): PortfolioItem {
  return { ...row, published: Boolean(row.published) };
}

export async function listPortfolio(): Promise<PortfolioItem[]> {
  const [rows] = await db().query<Row<PortfolioItem>[]>(
    `SELECT ${portfolioColumns} FROM portfolio_items ORDER BY service_slug, sort_order, id`,
  );
  return rows.map(toItem);
}

export async function listPublishedPortfolio(serviceSlug: string): Promise<PortfolioItem[]> {
  const [rows] = await db().execute<Row<PortfolioItem>[]>(
    `SELECT ${portfolioColumns} FROM portfolio_items WHERE service_slug = ? AND published = 1 ORDER BY sort_order, id`,
    [serviceSlug],
  );
  return rows.map(toItem);
}

/** Every published project, in display order (homepage and the Projects page). */
export async function listAllPublishedPortfolio(): Promise<PortfolioItem[]> {
  const [rows] = await db().query<Row<PortfolioItem>[]>(
    `SELECT ${portfolioColumns} FROM portfolio_items WHERE published = 1 ORDER BY sort_order, id`,
  );
  return rows.map(toItem);
}

export async function getPortfolioItem(id: number): Promise<PortfolioItem | null> {
  const [rows] = await db().execute<Row<PortfolioItem>[]>(`SELECT ${portfolioColumns} FROM portfolio_items WHERE id = ?`, [id]);
  return rows[0] ? toItem(rows[0]) : null;
}

export async function getPublishedPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const [rows] = await db().execute<Row<PortfolioItem>[]>(
    `SELECT ${portfolioColumns} FROM portfolio_items WHERE slug = ? AND published = 1 LIMIT 1`,
    [slug],
  );
  return rows[0] ? toItem(rows[0]) : null;
}

/** True when another project (not `exceptId`) already uses this slug. */
export async function portfolioSlugTaken(slug: string, exceptId: number | null): Promise<boolean> {
  const [rows] = await db().execute<Row<{ id: number }>[]>('SELECT id FROM portfolio_items WHERE slug = ? AND id <> ? LIMIT 1', [slug, exceptId ?? 0]);
  return rows.length > 0;
}

export type PortfolioInput = Omit<PortfolioItem, 'id'>;

export async function savePortfolioItem(id: number | null, input: PortfolioInput): Promise<number> {
  const values = portfolioFields.map(field => (field === 'published' ? (input.published ? 1 : 0) : input[field]));
  if (id) {
    await db().execute(`UPDATE portfolio_items SET ${portfolioFields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`, [...values, id]);
    return id;
  }
  const [result] = await db().execute<ResultSetHeader>(
    `INSERT INTO portfolio_items (${portfolioFields.join(', ')}) VALUES (${portfolioFields.map(() => '?').join(', ')})`,
    values,
  );
  return result.insertId;
}

export async function deletePortfolioItem(id: number): Promise<void> {
  await db().execute('DELETE FROM portfolio_items WHERE id = ?', [id]);
}

// --- "Am I a Muslim?" quiz (public/oneness.html) ---------------------------------------------

export type OnenessStats = { tried: number; passed: number; failed: number };
export type OnenessLead = { name: string; contact: string; result: 'failed' | 'unsure' | 'passed'; failed: string[]; unsure: string[] };

export async function getOnenessStats(): Promise<OnenessStats> {
  const [rows] = await db().query<Row<OnenessStats>[]>('SELECT tried, passed, failed FROM oneness_stats WHERE id = 1');
  const row = rows[0];
  return { tried: Number(row?.tried ?? 0), passed: Number(row?.passed ?? 0), failed: Number(row?.failed ?? 0) };
}

/** Counts one finished quiz (and which questions were failed or unsure) in a single transaction. */
export async function recordOnenessResult(failedIds: string[], unsureIds: string[]): Promise<OnenessStats> {
  const conn = await db().getConnection();
  try {
    await conn.beginTransaction();
    const passed = failedIds.length ? 0 : 1, failed = failedIds.length ? 1 : 0;
    await conn.execute(
      'INSERT INTO oneness_stats (id, tried, passed, failed) VALUES (1, 1, ?, ?) ON DUPLICATE KEY UPDATE tried = tried + 1, passed = passed + ?, failed = failed + ?',
      [passed, failed, passed, failed],
    );
    for (const [ids, column] of [[failedIds, 'failed'], [unsureIds, 'unsure']] as const) {
      if (!ids.length) continue;
      const rows = ids.map(() => `(?, ${column === 'failed' ? '1, 0' : '0, 1'})`).join(', ');
      await conn.query(
        `INSERT INTO oneness_reasons (question_id, failed, unsure) VALUES ${rows} ON DUPLICATE KEY UPDATE ${column} = ${column} + 1`,
        ids,
      );
    }
    const [rows] = await conn.query<Row<OnenessStats>[]>('SELECT tried, passed, failed FROM oneness_stats WHERE id = 1');
    await conn.commit();
    const row = rows[0];
    return { tried: Number(row?.tried ?? 0), passed: Number(row?.passed ?? 0), failed: Number(row?.failed ?? 0) };
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

export async function createOnenessLead(lead: OnenessLead): Promise<void> {
  await db().execute(
    'INSERT INTO oneness_leads (name, contact, result, failed_ids, unsure_ids) VALUES (?, ?, ?, ?, ?)',
    [lead.name, lead.contact, lead.result, lead.failed.join(','), lead.unsure.join(',')],
  );
}
