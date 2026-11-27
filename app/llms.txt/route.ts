import { llmsTxt } from '@/lib/llms';

// /llms.txt (llmstxt.org), rebuilt at most every ten minutes, like the cached portfolio reads.
export const revalidate = 600;

export async function GET() {
  return new Response(await llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
