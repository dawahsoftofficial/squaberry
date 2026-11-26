import 'server-only';
import { unstable_cache } from 'next/cache';
import { getPublishedPortfolioBySlug, listAllPublishedPortfolio, listPublishedPortfolio, type PortfolioItem } from './data';

// Public pages must still render if the database is unreachable, so every read falls back to [].
// Reads are cached for ten minutes under the "portfolio" tag; admin changes refresh it straight away
// (updateTag in app/admin/actions.ts), so pages don't wait on the database on every request.
export const portfolioTag = 'portfolio';
const cacheFor = { tags: [portfolioTag], revalidate: 600 };
const cachedAll = unstable_cache(listAllPublishedPortfolio, ['portfolio-all'], cacheFor);
const cachedForService = unstable_cache(listPublishedPortfolio, ['portfolio-service'], cacheFor);
const cachedBySlug = unstable_cache(getPublishedPortfolioBySlug, ['portfolio-slug'], cacheFor);

export async function safeAllProjects(): Promise<PortfolioItem[]> {
  try {
    return await cachedAll();
  } catch (error) {
    console.error('Projects could not be loaded:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function safeServiceProjects(slug: string): Promise<PortfolioItem[]> {
  try {
    return await cachedForService(slug);
  } catch (error) {
    console.error('Service projects could not be loaded:', error instanceof Error ? error.message : error);
    return [];
  }
}

/** A published project by its page slug. Throws if the database is down, so the page can show an error rather than a 404. */
export async function projectBySlug(slug: string): Promise<PortfolioItem | null> {
  return cachedBySlug(slug);
}

/** Up to `limit` other projects: same service first, then the rest in display order. */
export function relatedProjects(all: PortfolioItem[], project: PortfolioItem, limit = 3): PortfolioItem[] {
  const others = all.filter(item => item.id !== project.id);
  const same = others.filter(item => item.service_slug === project.service_slug);
  const rest = others.filter(item => item.service_slug !== project.service_slug);
  return [...same, ...rest].slice(0, limit);
}
