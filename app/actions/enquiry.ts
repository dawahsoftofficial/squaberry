'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import { createEnquiry } from '@/lib/data';
import { sendConfirmationEmail, sendEnquiryEmail } from '@/lib/mail';
import { topics } from '@/lib/services';

export type EnquiryState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  errors: Partial<Record<'name' | 'email' | 'topic' | 'message', string>>;
};

const RATE_LIMIT = 5; // enquiries per visitor...
const RATE_WINDOW_MS = 60 * 60 * 1000; // ...per hour
const MIN_FILL_MS = 3000; // faster than this is treated as a bot

// In-memory, per server process. IP addresses are never written to the database.
const recent = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  for (const [ip, stamps] of recent) {
    const fresh = stamps.filter(time => time > now - RATE_WINDOW_MS);
    if (fresh.length) recent.set(ip, fresh);
    else recent.delete(ip);
  }
  const stamps = recent.get(key) ?? [];
  if (stamps.length >= RATE_LIMIT) return true;
  recent.set(key, [...stamps, now]);
  return false;
}

function line(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

const success: EnquiryState = {
  status: 'success',
  message: 'Thanks — your message has been sent. We’ll reply by email.',
  errors: {},
};

export async function submitEnquiry(_previous: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Bots: a filled honeypot or an impossibly fast submission get a quiet "success" and nothing is stored.
  const started = Number(formData.get('started') || 0);
  if (line(formData.get('website'), 200) || (started > 0 && Date.now() - started < MIN_FILL_MS)) {
    return success;
  }

  const name = line(formData.get('name'), 120);
  const email = line(formData.get('email'), 254);
  const company = line(formData.get('company'), 120);
  const topic = line(formData.get('topic'), 60);
  const message = String(formData.get('message') ?? '').replace(/\r\n/g, '\n').trim();
  const source = line(formData.get('source'), 120);

  const errors: EnquiryState['errors'] = {};
  if (!name) errors.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (topic && !topics.includes(topic)) errors.topic = 'Please choose a topic from the list.';
  if (message.length < 10) errors.message = 'Please add a little more detail to your message.';
  else if (message.length > 5000) errors.message = 'Please keep your message under 5,000 characters.';
  if (Object.keys(errors).length) {
    return { status: 'error', message: 'Please check the highlighted fields and try again.', errors };
  }

  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) {
    return {
      status: 'error',
      message: 'You’ve sent several messages in a short time. Please try again later or email hello@squaberry.co.uk.',
      errors: {},
    };
  }

  const enquiry = { name, email, company: company || null, topic: topic || null, message, source_page: source || null };
  try {
    const id = await createEnquiry(enquiry);
    // Email the team, then send the visitor a copy, once they have their on-screen confirmation.
    // A mail problem never loses the enquiry (it is already saved).
    after(async () => {
      await sendEnquiryEmail({ id, ...enquiry });
      await sendConfirmationEmail({ id, ...enquiry });
    });
  } catch (error) {
    console.error('Enquiry could not be saved:', error instanceof Error ? error.message : error);
    return {
      status: 'error',
      message: 'Sorry, your message couldn’t be sent. Please try again or email hello@squaberry.co.uk.',
      errors: {},
    };
  }

  return success;
}
