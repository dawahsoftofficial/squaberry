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
