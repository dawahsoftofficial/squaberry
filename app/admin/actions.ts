'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { portfolioTag } from '@/lib/portfolio';
import { createSessionValue, passwordMatches, requireAdmin, SESSION_COOKIE } from '@/lib/auth';
import {
  deleteEnquiry,
  deletePortfolioItem,
  enquiryStatuses,
  portfolioSlugTaken,
  savePortfolioItem,
  setEnquiryStatus,
  type EnquiryStatus,
} from '@/lib/data';
import { getService } from '@/lib/services';
import { galleryImages, slugify } from '@/lib/case-study';

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

export type PortfolioFormState = {
  error: string;
  fields: Partial<Record<'title' | 'service_slug' | 'site_url' | 'image_url' | 'slug' | 'gallery', string>>;
};

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

  const slug = slugify(text(formData, 'slug', 140) || title);
  const gallery = text(formData, 'gallery', 6000);

  const fields: PortfolioFormState['fields'] = {};
  if (!getService(serviceSlug)) fields.service_slug = 'Choose a service.';
  if (!title) fields.title = 'Add a project title.';
  if (siteUrl && !validUrl(siteUrl)) fields.site_url = 'Use a full address starting with https://';
  // Images may be full addresses or files in /public (e.g. /assets/portfolio/shop.png).
  const sitePath = /^\/(?!\/)[\w\-./]+$/.test(imageUrl);
  if (imageUrl && !sitePath && !validUrl(imageUrl)) fields.image_url = 'Use a full image address starting with https://, or a site path starting with /';
  if (title && !slug) fields.slug = 'Use letters or numbers in the page address.';
  else if (slug && (await portfolioSlugTaken(slug, id))) fields.slug = 'Another project already uses this page address.';
  const galleryLines = gallery.split('\n').filter(line => line.trim());
  if (galleryLines.length !== galleryImages(gallery).length) fields.gallery = 'Each line needs an image address (https://… or a site path starting with /), optionally followed by | and a description.';
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
    slug,
    intro: text(formData, 'intro', 600) || null,
    scope: text(formData, 'scope', 600) || null,
    overview: text(formData, 'overview', 8000) || null,
    challenge: text(formData, 'challenge', 8000) || null,
    solution: text(formData, 'solution', 8000) || null,
    results: text(formData, 'results', 8000) || null,
    gallery: gallery || null,
    quote: text(formData, 'quote', 2000) || null,
    quote_name: text(formData, 'quote_name', 120) || null,
    quote_role: text(formData, 'quote_role', 120) || null,
  });
  updateTag(portfolioTag); // public pages read the portfolio through a cache (lib/portfolio.ts)
  revalidatePath('/admin', 'layout');
  revalidatePath(`/services/${serviceSlug}`);
  revalidatePath('/work', 'layout');
  redirect('/admin/portfolio?saved=1');
}

export async function removePortfolio(formData: FormData): Promise<void> {
  await requireAdmin();
  await deletePortfolioItem(idFrom(formData));
  updateTag(portfolioTag);
  revalidatePath('/admin', 'layout');
  redirect('/admin/portfolio?deleted=1');
}
