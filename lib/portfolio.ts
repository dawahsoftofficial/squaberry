import 'server-only';
import { listAllPublishedPortfolio, listPublishedPortfolio, type PortfolioItem } from './data';

// Public pages must still render if the database is unreachable, so every read falls back to [].

export async function safeAllProjects(): Promise<PortfolioItem[]> {
  try {
    return await listAllPublishedPortfolio();
  } catch (error) {
    console.error('Projects could not be loaded:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function safeServiceProjects(slug: string): Promise<PortfolioItem[]> {
  try {
    return await listPublishedPortfolio(slug);
  } catch (error) {
    console.error('Service projects could not be loaded:', error instanceof Error ? error.message : error);
    return [];
  }
}
