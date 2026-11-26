import 'server-only';
import { headers } from 'next/headers';

// Shared by the project and product forms: 5 submissions per visitor per hour, held in memory per
// server process. IP addresses are never written to the database.
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const recent = new Map<string, number[]>();

export async function visitorKey(): Promise<string> {
  const headerList = await headers();
  return headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
}

export function rateLimited(key: string): boolean {
  const now = Date.now();
  for (const [ip, stamps] of recent) {
    const fresh = stamps.filter(time => time > now - WINDOW_MS);
    if (fresh.length) recent.set(ip, fresh);
    else recent.delete(ip);
  }
  const stamps = recent.get(key) ?? [];
  if (stamps.length >= LIMIT) return true;
  recent.set(key, [...stamps, now]);
  return false;
}

