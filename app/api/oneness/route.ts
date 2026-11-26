import { NextResponse, type NextRequest } from 'next/server';
import { createOnenessLead, getOnenessStats, recordOnenessResult } from '@/lib/data';
import { rateLimited, visitorKey } from '@/lib/rate-limit';

// Backend for the "Am I a Muslim?" quiz at /oneness.html (a static page in public/).
//   GET  /api/oneness?action=stats    → { tried, passed, failed }
//   POST /api/oneness?action=finish   { failed: [ids], unsure: [ids] }            → updated { tried, passed, failed }
//   POST /api/oneness?action=lead     { name, contact, failed: [ids], unsure: [ids] } → { ok: true }
// The page hides the counters if stats fail, so a database outage never breaks the quiz itself.

export const dynamic = 'force-dynamic';

// Keep in sync with the `id` of each question in public/oneness.html.
const QUESTION_IDS = new Set([
  'dua-to-dead', 'intermediaries', 'shirk-forgiven', 'all-religions',
  'man-made-law', 'punishments-barbaric', 'replace-punishments', 'judging-man-made-law',
  'better-guidance', 'hating-islam', 'my-body-my-choice', 'mocking',
  'god-in-games', 'shirk-songs-films', 'magic', 'siding-against-muslims',
  'above-shariah', 'turning-away', 'final-prophet', 'haram-is-halal',
  'same-sex-halal', 'quran-changed',
]);

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 4096) return {};
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function cleanIds(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((id): id is string => typeof id === 'string' && QUESTION_IDS.has(id)))];
}

function cleanText(value: unknown, max: number): string {
  // eslint-disable-next-line no-control-regex
  return (typeof value === 'string' ? value.trim().replace(/[\u0000-\u001F\u007F]+/g, ' ') : '').slice(0, max);
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('action') !== 'stats') return json(404, { error: 'not found' });
  try {
    return json(200, await getOnenessStats());
  } catch (error) {
    console.error('oneness stats failed', error);
    return json(503, { error: 'unavailable' });
  }
}

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');

  if (action === 'finish') {
    const body = await readBody(request);
    const failed = cleanIds(body.failed);
    const unsure = cleanIds(body.unsure).filter(id => !failed.includes(id));
    try {
      return json(200, await recordOnenessResult(failed, unsure));
    } catch (error) {
      console.error('oneness finish failed', error);
      return json(503, { error: 'unavailable' });
    }
  }

  if (action === 'lead') {
    if (rateLimited(`oneness:${await visitorKey()}`)) return json(429, { error: 'too many' });
    const body = await readBody(request);
    const name = cleanText(body.name, 80);
    const contact = cleanText(body.contact, 120);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isPhone = /^\+?[\d\s\-()]{7,20}$/.test(contact) && contact.replace(/\D/g, '').length >= 7;
    if (name.length < 2 || (!isEmail && !isPhone)) return json(422, { error: 'invalid' });

    const failed = cleanIds(body.failed);
    const unsure = cleanIds(body.unsure).filter(id => !failed.includes(id));
    try {
      await createOnenessLead({ name, contact, result: failed.length ? 'failed' : unsure.length ? 'unsure' : 'passed', failed, unsure });
      return json(200, { ok: true });
    } catch (error) {
      console.error('oneness lead failed', error);
      return json(503, { error: 'unavailable' });
    }
  }

  return json(404, { error: 'not found' });
}
