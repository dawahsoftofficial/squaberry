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
  status: EnquiryStatus;
  created_at: Date;
};

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
    'INSERT INTO enquiries (name, email, company, topic, message, source_page) VALUES (?, ?, ?, ?, ?, ?)',
    [input.name, input.email, input.company, input.topic, input.message, input.source_page],
  );
  return result.insertId;
}

export async function listEnquiries(status: EnquiryStatus | 'inbox' | 'all'): Promise<Enquiry[]> {
  const where = status === 'all' ? '' : status === 'inbox' ? "WHERE status <> 'archived'" : 'WHERE status = ?';
  const params = status === 'all' || status === 'inbox' ? [] : [status];
  const [rows] = await db().execute<Row<Enquiry>[]>(
    `SELECT id, name, email, company, topic, message, source_page, status, created_at FROM enquiries ${where} ORDER BY created_at DESC, id DESC LIMIT 500`,
    params,
  );
  return rows;
}

export const countEnquiries = cache(async (): Promise<Record<EnquiryStatus | 'all', number>> => {
  const [rows] = await db().query<Row<{ status: EnquiryStatus; total: number }>[]>(
    'SELECT status, COUNT(*) AS total FROM enquiries GROUP BY status',
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
    'SELECT id, name, email, company, topic, message, source_page, status, created_at FROM enquiries WHERE id = ?',
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
