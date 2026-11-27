import { llmsFullTxt } from '@/lib/llms';

// /llms-full.txt (llmstxt.org), rebuilt at most every ten minutes, like the cached portfolio reads.
export const revalidate = 600;

export async function GET() {
  return new Response(await llmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
