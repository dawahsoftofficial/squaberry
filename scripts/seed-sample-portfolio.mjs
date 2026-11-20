// Adds (or removes) two clearly labelled sample projects per service so portfolio sections aren't empty
// before real work is added. Samples are identified by their image path under /assets/portfolio/samples/.
//
//   npm run db:samples          add samples (skips any that already exist)
//   npm run db:samples:remove   delete every sample
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const SAMPLE_PREFIX = '/assets/portfolio/samples/';

const samples = [
  ['web-app-development', 'Harbour & Pine online shop', 'Homeware retailer', 'An e-commerce store with a calm, product-first layout, quick checkout and easy stock management for a small team.', 'harbour-pine-shop'],
  ['web-app-development', 'Fieldnote booking app', 'Physiotherapy clinic', 'A web app for online appointment booking, clinician calendars and patient reminders, replacing phone-only bookings.', 'fieldnote-bookings'],
  ['design-digital-experiences', 'Oakline Coffee identity', 'Independent coffee roaster', 'A bold geometric identity carried across packaging, cups, print and the web, built around a warm, earthy palette.', 'oakline-coffee-identity'],
  ['design-digital-experiences', 'Tidy mobile app', 'Home cleaning service', 'A friendly booking app designed around three taps: choose a service, pick a time, confirm.', 'tidy-app-ui'],
  ['cloud-infrastructure', 'Northgate cloud migration', 'Logistics company', 'Moving ageing on-site servers to the cloud, with monitoring dashboards and alerts that flag problems early.', 'northgate-cloud-migration'],
  ['cloud-infrastructure', 'Brightwave release pipeline', 'Digital studio', 'Automated builds, tests and deployments, turning releases from a nervous afternoon into a routine click.', 'brightwave-deployments'],
  ['ai-workflow-automation', 'Kettle & Co invoice flow', 'Accountancy practice', 'An automated workflow that reads incoming invoices, files them and routes approvals, with no copy and paste.', 'kettle-invoice-automation'],
  ['ai-workflow-automation', 'Meridian inbox assistant', 'Lettings agency', 'A practical AI assistant that sorts enquiries by type and drafts replies for the team to check and send.', 'meridian-inbox-assistant'],
  ['it-support-security', 'Wren device security', 'Dental group', 'Managed laptops and phones across several practices, with updates, multi-factor sign-in and a clear security score.', 'wren-device-security'],
  ['it-support-security', 'Copperfield backups', 'Charity', 'Automatic daily backups with tested restores, so important records can be recovered quickly when it matters.', 'copperfield-backups'],
  ['strategy-consulting', 'Larkspur digital roadmap', 'Retail business', 'A prioritised twelve-month plan for systems, website and data, agreed with the leadership team.', 'larkspur-roadmap'],
  ['strategy-consulting', 'Assembly tool selection', 'Architecture practice', 'An independent comparison of project management tools, ending in a clear shortlist and rollout plan.', 'assembly-tool-selection'],
];

const remove = process.argv.includes('--remove');
const caPath = process.env.DB_CA_CERT_PATH;
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: caPath ? { ca: readFileSync(caPath, 'utf8') } : { rejectUnauthorized: false },
  connectTimeout: 15000,
});

if (remove) {
  const [result] = await connection.execute('DELETE FROM portfolio_items WHERE image_url LIKE ?', [`${SAMPLE_PREFIX}%`]);
  console.log(`Removed ${result.affectedRows} sample projects.`);
} else {
  let added = 0;
  for (const [index, [service, title, sector, summary, file]] of samples.entries()) {
    const image = `${SAMPLE_PREFIX}${file}.png`;
    const [existing] = await connection.execute('SELECT id FROM portfolio_items WHERE image_url = ?', [image]);
    if (existing.length) continue;
    await connection.execute(
      'INSERT INTO portfolio_items (service_slug, title, client, summary, site_url, image_url, sort_order, published) VALUES (?, ?, ?, ?, NULL, ?, ?, 1)',
      [service, title, `Sample project · ${sector}`, summary, image, 100 + (index % 2)],
    );
    added += 1;
  }
  console.log(`Added ${added} sample projects (${samples.length - added} already present).`);
}
await connection.end();
