import type { Metadata } from 'next';
import { mediaUrl } from './media-url';

// Shared SEO settings. Every public page builds its metadata with pageMetadata() so titles, canonical
// URLs, Open Graph and Twitter cards stay complete and consistent (a page that set only some Open Graph
// fields would otherwise drop the site name, locale and image it inherits).

export const siteUrl = 'https://squaberry.co.uk';
export const siteName = 'Squaberry';
export const siteEmail = 'hello@squaberry.co.uk';
export const siteTagline = 'Fresh ideas. Solid tech.';
export const siteDescription =
  'Squaberry is a digital studio for web and app development, design, digital marketing and IT support. Fresh ideas. Solid tech.';

/** Share cards are pre-rendered 1200×630 JPEGs in public/og/ (see scripts/og-cards.mjs). */
export const ogSize = { width: 1200, height: 630 };
export const ogImage = (key: string) => mediaUrl(`/og/${key}.jpg`);

type PageMeta = {
  /** Page title; "— Squaberry" is added unless `absoluteTitle` is set. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** Site path, e.g. "/services". Used for the canonical URL and og:url. */
  path: string;
  /** Share card key in public/og/ (defaults to the home card) or a site image path. */
  og?: string;
  ogAlt?: string;
  type?: 'website' | 'article';
};

export function pageMetadata({ title, absoluteTitle = false, description, path, og = 'home', ogAlt, type = 'website' }: PageMeta): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} — ${siteName}`;
  const isCard = !og.includes('/'); // a card key, rather than a site path or full URL
  const image = { url: isCard ? ogImage(og) : og, ...(isCard ? ogSize : {}), alt: ogAlt ?? fullTitle };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName, locale: 'en_GB', url: path, title: fullTitle, description, images: [image] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  };
}

/** Shortens text to at most `max` characters at a word boundary, for meta descriptions. */
export function clip(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:–—-]+$/, '')}…`;
}

/** Absolute URL for a site path. */
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
