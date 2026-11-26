import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Spam protection shared by the enquiry and product forms. Everything runs on the server and is held in
// memory per process (nothing extra is stored in the database):
//
// 1. A signed form token, issued by the server when a form loads (app/actions/form-token.ts). It proves
//    the form was opened in a browser, at least MIN_FILL_MS before it was sent, and can be used once.
// 2. A content score: link stuffing, HTML/BBCode links, common spam pitches, throwaway email domains and
//    random-letter names. Above the threshold the submission is dropped quietly.
// 3. Duplicate detection (same email and message within a day) and limits per email address and for
//    the whole site, on top of the per-IP limit in lib/rate-limit.ts.
//
// Spam gets the normal "thanks" response so bots learn nothing; genuine visitors who hit a limit are told.

export const MIN_FILL_MS = 3000; // a person can't open and complete the form faster than this
const TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET ?? '';
  if (value.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set to at least 32 characters.');
  return value;
}
const sign = (payload: string) => createHmac('sha256', secret()).update(`form-token:${payload}`).digest('base64url');

/** A fresh token: "<issued ms>.<nonce>.<signature>". */
export function issueFormToken(): string {
  const payload = `${Date.now()}.${randomBytes(12).toString('base64url')}`;
  return `${payload}.${sign(payload)}`;
}

export type TokenCheck = 'ok' | 'missing' | 'invalid' | 'too-fast' | 'expired' | 'used';

const usedTokens = new Map<string, number>(); // nonce -> expiry

export function checkFormToken(token: string): TokenCheck {
  if (!token) return 'missing';
  const [issued, nonce, signature] = token.split('.');
  if (!issued || !nonce || !signature) return 'invalid';
  const expected = Buffer.from(sign(`${issued}.${nonce}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid';
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0) return 'invalid';
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > TOKEN_MAX_AGE_MS) return 'expired';
  if (usedTokens.has(nonce)) return 'used';
  return 'ok';
}

/** Marks a token as spent once its submission has been accepted. */
export function spendFormToken(token: string): void {
  const now = Date.now();
  for (const [nonce, expires] of usedTokens) if (expires < now) usedTokens.delete(nonce);
  const nonce = token.split('.')[1];
  if (nonce) usedTokens.set(nonce, now + TOKEN_MAX_AGE_MS);
}

// --- Content score ---------------------------------------------------------------------------------

const disposableDomains = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com', 'grr.la', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'tempmail.net', 'yopmail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'throwawaymail.com', 'fakeinbox.com', 'mailnesia.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'tempr.email',
  'discard.email', 'spamgourmet.com', 'mytemp.email', 'burnermail.io', 'moakt.com', 'tempmailo.com', 'emailfake.com',
]);

// Phrases typical of unsolicited pitches and scams (each match adds 2).
const spamPhrases = [
  /\b(crypto(currency)?|bitcoin|btc|forex|binary options?|nft drop)\b/i,
  /\b(casino|betting|slot machines?|viagra|cialis|porn|xxx|escort|onlyfans|sex dating)\b/i,
  /\b(backlinks?|guest posts?|link building|da\s*\/\s*pa|domain authority)\b/i,
  /\b(rank (your|ur) (website|site)|first page of google|top of google|increase (your )?(website )?traffic|boost your (seo|ranking))\b/i,
  /\b(unsubscribe|opt[- ]out|this is not spam|reply stop)\b/i,
  /\b(loan offer|guaranteed (income|profit|returns)|work from home|make money (fast|online)|investment opportunity)\b/i,
  /\b(we are (an?|the) (seo|digital marketing|web design|software) (agency|company|team)|outsourc(e|ing) (your )?(development|work))\b/i,
];

const urlPattern = /(https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+\.(com|net|org|ru|cn|xyz|top|info|biz|io|co|online|site|shop|store|click|link)\b/gi;
const hasUrl = new RegExp(urlPattern.source, 'i');
// Formal cold-email openings: common in genuine messages too, so they only add 1.
const coldGreeting = /\b(dear (website )?(owner|sir|madam|sir\/madam)|to whom it may concern)\b/i;

export type SpamFields = { name: string; email: string; company?: string; message: string };

/** 0 for an ordinary enquiry; 3 or more is treated as spam. */
export function spamScore({ name, email, company = '', message }: SpamFields): number {
  let score = 0;
  const links = message.match(urlPattern)?.length ?? 0;
  if (links >= 3) score += 3;
  else if (links > 0) score += 1; // sharing your own site is normal; one link alone is never enough
  if (/<\s*a\s|<\/\s*a\s*>|\[url[=\]]|\[link[=\]]/i.test(message)) score += 3;
  if (hasUrl.test(name) || /https?:\/\//i.test(company)) score += 3;
  for (const phrase of spamPhrases) if (phrase.test(`${name} ${company} ${message}`)) score += 2;
  if (coldGreeting.test(message)) score += 1;
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (disposableDomains.has(domain)) score += 3;
  // Random strings such as "XkqTzRbWmN" in the name.
  const compactName = name.replace(/\s+/g, '');
  if (/^[A-Za-z]{8,}$/.test(compactName) && /[a-z][A-Z].*[a-z][A-Z]/.test(compactName)) score += 2;
  if (/[Ѐ-ӿ]{5,}/.test(message) && !/[a-z]{4,}/i.test(message.replace(/[Ѐ-ӿ]/g, ''))) score += 2; // Cyrillic-only text
  const letters = message.replace(/[^a-z]/gi, '');
  if (letters.length > 40 && letters === letters.toUpperCase()) score += 1;
  return score;
}

// --- Duplicates and limits ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const seenMessages = new Map<string, number>(); // hash -> expiry
const perEmail = new Map<string, number[]>();
let siteWide: number[] = [];
const EMAIL_LIMIT = 3; // accepted per address per day
const SITE_LIMIT = 40; // accepted per hour across the whole site (stops floods from many addresses)

const fingerprint = (email: string, message: string) =>
  createHash('sha256').update(`${email.toLowerCase()}\n${message.replace(/\s+/g, ' ').trim().toLowerCase()}`).digest('base64url');

export function isDuplicate(email: string, message: string): boolean {
  const now = Date.now();
  for (const [hash, expires] of seenMessages) if (expires < now) seenMessages.delete(hash);
  return seenMessages.has(fingerprint(email, message));
}

/** 'email' or 'site' when a limit is reached; otherwise records the submission and returns null. */
export function acceptanceLimit(email: string, message: string): 'email' | 'site' | null {
  const now = Date.now();
  const key = email.toLowerCase();
  for (const [address, stamps] of perEmail) {
    const fresh = stamps.filter(time => time > now - DAY_MS);
    if (fresh.length) perEmail.set(address, fresh);
    else perEmail.delete(address);
  }
  siteWide = siteWide.filter(time => time > now - 60 * 60 * 1000);
  if ((perEmail.get(key)?.length ?? 0) >= EMAIL_LIMIT) return 'email';
  if (siteWide.length >= SITE_LIMIT) return 'site';
  perEmail.set(key, [...(perEmail.get(key) ?? []), now]);
  siteWide.push(now);
  seenMessages.set(fingerprint(email, message), now + DAY_MS);
  return null;
}

/**
 * The combined verdict for a submission. A missing or expired token (no JavaScript, or a page left open
 * for hours) is allowed only for content with at most one minor signal (e.g. a single link).
 */
export function screenSubmission(token: string, fields: SpamFields): 'spam' | 'duplicate' | 'ok' {
  const check = checkFormToken(token);
  if (check === 'invalid' || check === 'too-fast' || check === 'used') return 'spam';
  const score = spamScore(fields);
  if (score >= (check === 'ok' ? 3 : 2)) return 'spam';
  if (isDuplicate(fields.email, fields.message)) return 'duplicate';
  return 'ok';
}
