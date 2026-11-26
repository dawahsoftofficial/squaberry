'use server';

import { issueFormToken } from '@/lib/spam';

/** Called by the enquiry and product forms when they load; see lib/spam.ts. */
export async function getFormToken(): Promise<string> {
  return issueFormToken();
}
