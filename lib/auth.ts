import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Single-admin login: the password lives in ADMIN_PASSWORD, and a signed, expiring cookie
// (HMAC with ADMIN_SESSION_SECRET) marks the session. Every admin page and action calls requireAdmin().

export const SESSION_COOKIE = 'sq_admin';
const SESSION_HOURS = 12;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET ?? '';
  if (value.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set to at least 32 characters.');
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (expected.length < 12) throw new Error('ADMIN_PASSWORD must be set to at least 12 characters.');
  // Compare HMACs so the comparison takes the same time whatever the input length.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${expected}`));
}

export function createSessionValue(): { value: string; maxAge: number } {
  const maxAge = SESSION_HOURS * 60 * 60;
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  return { value: `${expires}.${sign(`session:${expires}`)}`, maxAge };
}

export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value ?? '';
  const [expires, signature] = value.split('.');
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, sign(`session:${expires}`));
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
