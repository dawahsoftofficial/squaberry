'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSessionValue, passwordMatches, requireAdmin, SESSION_COOKIE } from '@/lib/auth';
import {
  deleteEnquiry,
  deletePortfolioItem,
  enquiryStatuses,
  savePortfolioItem,
  setEnquiryStatus,
  type EnquiryStatus,
} from '@/lib/data';
import { getService } from '@/lib/services';

// --- Session --------------------------------------------------------------------------------

const failedLogins = new Map<string, number[]>();
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export type LoginState = { error: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const attempts = (failedLogins.get(ip) ?? []).filter(time => time > now - LOGIN_WINDOW_MS);
  if (attempts.length >= LOGIN_LIMIT) {
    return { error: 'Too many attempts. Please wait 15 minutes and try again.' };
  }

  if (!passwordMatches(String(formData.get('password') ?? ''))) {
    failedLogins.set(ip, [...attempts, now]);
    return { error: 'That password isn’t right.' };
  }

  failedLogins.delete(ip);
  const session = createSessionValue();
  (await cookies()).set(SESSION_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: session.maxAge,
  });
  redirect('/admin');
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: '/admin' });
  redirect('/admin/login');
}

// --- Enquiries ------------------------------------------------------------------------------

function idFrom(formData: FormData): number {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id < 1) throw new Error('Invalid id');
  return id;
}

export async function updateEnquiryStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const status = String(formData.get('status')) as EnquiryStatus;
  if (!enquiryStatuses.includes(status)) throw new Error('Invalid status');
  const id = idFrom(formData);
  await setEnquiryStatus(id, status);
  revalidatePath('/admin', 'layout');
}

export async function removeEnquiry(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteEnquiry(idFrom(formData));
  revalidatePath('/admin', 'layout');
  redirect('/admin?deleted=1');
}

// --- Portfolio ------------------------------------------------------------------------------

export type PortfolioFormState = { error: string; fields: Partial<Record<'title' | 'service_slug' | 'site_url' | 'image_url', string>> };

function text(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? '').trim().slice(0, max);
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function savePortfolio(_previous: PortfolioFormState, formData: FormData): Promise<PortfolioFormState> {
  await requireAdmin();
  const id = Number(formData.get('id')) || null;
  const serviceSlug = text(formData, 'service_slug', 60);
  const title = text(formData, 'title', 120);
  const siteUrl = text(formData, 'site_url', 500);
  const imageUrl = text(formData, 'image_url', 500);

  const fields: PortfolioFormState['fields'] = {};
  if (!getService(serviceSlug)) fields.service_slug = 'Choose a service.';
  if (!title) fields.title = 'Add a project title.';
  if (siteUrl && !validUrl(siteUrl)) fields.site_url = 'Use a full address starting with https://';
  // Images may be full addresses or files in /public (e.g. /assets/portfolio/samples/shop.png).
  const sitePath = /^\/(?!\/)[\w\-./]+$/.test(imageUrl);
  if (imageUrl && !sitePath && !validUrl(imageUrl)) fields.image_url = 'Use a full image address starting with https://, or a site path starting with /';
  if (Object.keys(fields).length) return { error: 'Please fix the highlighted fields.', fields };

  await savePortfolioItem(id, {
    service_slug: serviceSlug,
    title,
    client: text(formData, 'client', 120) || null,
    summary: text(formData, 'summary', 400) || null,
    site_url: siteUrl || null,
    image_url: imageUrl || null,
    sort_order: Number.parseInt(String(formData.get('sort_order') ?? '0'), 10) || 0,
    published: formData.get('published') === 'on',
  });
  revalidatePath('/admin', 'layout');
  revalidatePath(`/services/${serviceSlug}`);
  redirect('/admin/portfolio?saved=1');
}

export async function removePortfolio(formData: FormData): Promise<void> {
  await requireAdmin();
  await deletePortfolioItem(idFrom(formData));
  revalidatePath('/admin', 'layout');
  redirect('/admin/portfolio?deleted=1');
}
