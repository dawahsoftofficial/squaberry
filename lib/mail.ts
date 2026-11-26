import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

// Enquiry notifications over SMTP (Zoho Mail). Configured by SMTP_* and MAIL_* in the environment;
// with no SMTP_HOST, sending is skipped and enquiries are only saved to the database.

const SITE_URL = 'https://squaberry.co.uk';

let transporter: Transporter | null = null;

function smtp(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 is SSL from the start; 587 upgrades with STARTTLS
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

/** Logs in to the SMTP server without sending anything. */
export async function verifyMail(): Promise<boolean> {
  const client = smtp();
  if (!client) return false;
  await client.verify();
  return true;
}

export type EnquiryMail = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  topic: string | null;
  message: string;
  source_page: string | null;
};

const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string);

/** Emails a new enquiry to the team. Never throws: the enquiry is already saved, so failures are only logged. */
export async function sendEnquiryEmail(enquiry: EnquiryMail): Promise<void> {
  const client = smtp();
  if (!client) return;
  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!to || !from) return;

  const adminUrl = `${SITE_URL}/admin/enquiries/${enquiry.id}`;
  const rows: [string, string][] = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Company', enquiry.company || '–'],
    ['Topic', enquiry.topic || '–'],
    ['Sent from', enquiry.source_page || '–'],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    enquiry.message,
    '',
    `Reply to this email to answer ${enquiry.name}, or open it in the admin: ${adminUrl}`,
  ].join('\n');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
    ${rows.map(([label, value]) => `<tr><td style="color:#666;vertical-align:top">${label}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`).join('\n    ')}
  </table>
  <p style="white-space:pre-wrap;margin:20px 0;padding:16px;border-radius:8px;background:#f4f2ff">${escapeHtml(enquiry.message)}</p>
  <p style="color:#666">Reply to this email to answer ${escapeHtml(enquiry.name)}, or <a href="${adminUrl}">open it in the admin</a>.</p>
</div>`;

  try {
    await client.sendMail({
      from,
      to,
      replyTo: { name: oneLine(enquiry.name), address: enquiry.email },
      subject: oneLine(`New enquiry${enquiry.topic ? `: ${enquiry.topic}` : ''} from ${enquiry.name}`).slice(0, 180),
      text,
      html,
    });
  } catch (error) {
    console.error(`Enquiry ${enquiry.id} email could not be sent:`, error instanceof Error ? error.message : error);
  }
}

// A confirmation goes to whatever address was typed into the form, so cap it per recipient to stop the
// form being used to send mail to strangers (on top of the per-IP limit, honeypot and timing check).
const CONFIRM_LIMIT = 2;
const CONFIRM_WINDOW_MS = 24 * 60 * 60 * 1000;
const confirmations = new Map<string, number[]>();

function confirmationAllowed(address: string): boolean {
  const now = Date.now();
  for (const [key, stamps] of confirmations) {
    const fresh = stamps.filter(time => time > now - CONFIRM_WINDOW_MS);
    if (fresh.length) confirmations.set(key, fresh);
    else confirmations.delete(key);
  }
  const key = address.toLowerCase();
  const stamps = confirmations.get(key) ?? [];
  if (stamps.length >= CONFIRM_LIMIT) return false;
  confirmations.set(key, [...stamps, now]);
  return true;
}

const PREVIEW_LIMIT = 1000;

/** Emails the visitor a confirmation with a copy of their enquiry. Never throws; failures are only logged. */
export async function sendConfirmationEmail(enquiry: EnquiryMail): Promise<void> {
  const client = smtp();
  if (!client) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const team = process.env.MAIL_TO || process.env.SMTP_USER;
  if (!from || !team) return;
  if (!confirmationAllowed(enquiry.email)) {
    console.warn(`Enquiry ${enquiry.id}: confirmation skipped (daily limit for this address reached).`);
    return;
  }

  const firstName = oneLine(enquiry.name).split(' ')[0] || 'there';
  const message = enquiry.message.length > PREVIEW_LIMIT ? `${enquiry.message.slice(0, PREVIEW_LIMIT).trimEnd()}…` : enquiry.message;
  const rows: [string, string][] = [
    ['Topic', enquiry.topic || 'General enquiry'],
    ...(enquiry.company ? [['Company', enquiry.company] as [string, string]] : []),
  ];

  const text = [
    `Hi ${firstName},`,
    '',
    'Thanks for getting in touch with Squaberry. We’ve received your message and one of the team will reply by email soon.',
    '',
    'Here’s a copy of what you sent:',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    message,
    '',
    'Need to add anything? Just reply to this email.',
    '',
    'The Squaberry team',
    SITE_URL,
    '',
    `You’re receiving this because this address was entered in the enquiry form on squaberry.co.uk. If that wasn’t you, you can ignore this email.`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en-GB"><body style="margin:0;padding:0;background:#f3f1ec">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec">
  <tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:18px;overflow:hidden;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
      <tr><td style="padding:22px 28px;background:#1c1c1c">
        <span style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:3px;background:#ecff95;vertical-align:middle"></span>
        <span style="color:#fffffd;font-size:18px;font-weight:bold;letter-spacing:-0.3px;vertical-align:middle">Squaberry</span>
      </td></tr>
      <tr><td style="padding:32px 28px 8px">
        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;letter-spacing:-0.4px">Thanks, ${escapeHtml(firstName)}. We’ve got your message.</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#444">One of the team will read it and reply by email soon. Here’s a copy of what you sent:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;background:#f4f2ff">
          <tr><td style="padding:18px 20px">
            ${rows.map(([label, value]) => `<p style="margin:0 0 6px;font-size:13px;color:#6a5bb5"><strong>${label}:</strong> <span style="color:#1a1a1a">${escapeHtml(value)}</span></p>`).join('')}
            <p style="margin:12px 0 0;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p>
          </td></tr>
        </table>
        <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#444">Need to add anything? Just reply to this email.</p>
        <p style="margin:18px 0 28px;font-size:15px;line-height:1.6">The Squaberry team</p>
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #ecebe6;font-size:12px;line-height:1.6;color:#888">
        <a href="${SITE_URL}" style="color:#6a5bb5;text-decoration:none">squaberry.co.uk</a> · Fresh ideas. Solid tech.<br>
        You’re receiving this because this address was entered in the enquiry form on squaberry.co.uk. If that wasn’t you, you can ignore this email.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await client.sendMail({
      from,
      to: { name: oneLine(enquiry.name), address: enquiry.email },
      replyTo: team,
      subject: 'We’ve received your message | Squaberry',
      text,
      html,
    });
  } catch (error) {
    console.error(`Enquiry ${enquiry.id} confirmation could not be sent:`, error instanceof Error ? error.message : error);
  }
}
