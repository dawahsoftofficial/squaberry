// Adds Squaberry's showcase projects to the portfolio (matched by site address, so re-running
// updates them instead of duplicating), and removes the old placeholder "sample" projects.
//
//   npm run db:portfolio
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

// [service, title, sector, headline shown on the card, live site, cover image]
const projects = [
  ['web-app-development', 'Muntada Aid', 'Charity', 'A giving platform that turns urgent appeals into donations', 'https://muntadaaid.org/', 'muntada-aid'],
  ['web-app-development', 'Chips n Chops', 'Food delivery', 'Ordering made as quick as the food it delivers', 'https://chipsnchops.com/', 'chips-n-chops'],
  ['design-digital-experiences', 'Pure Half', 'Marriage app', 'A private, respectful way to find your other half', 'https://purehalf.com/', 'pure-half'],
  ['web-app-development', 'Fit Track Gym', 'Fitness', 'A bold home for a women-only gym in Rawalpindi', 'https://fittrackgym.com/', 'fit-track-gym'],
  ['design-digital-experiences', 'Think Bambu', 'Agency', 'A playful, confident site for a growth marketing agency', 'https://www.think-bambu.com/', 'think-bambu'],
  ['web-app-development', 'Discover Islam', 'Education', 'Outreach, exhibitions and learning in one welcoming place', 'https://discoverislam.co.uk/', 'discover-islam'],
  ['design-digital-experiences', 'Audio Brochure', 'Audio platform', 'Short narrated introductions, designed for listening', 'https://audio-brochure.com/', 'audio-brochure'],
  ['web-app-development', 'New Muslim Stories', 'Searchable archive', '2,600+ stories, searchable by country and background', 'https://newmuslimstories.com/', 'new-muslim-stories'],
  ['web-app-development', 'Lareeza', 'E-commerce', 'A calm online shop for herbal massage oils', 'https://lareeza.com/', 'lareeza'],
  ['web-app-development', 'Katori', 'Product launch', 'A focused product page for a titanium cutting board', 'https://buykatori.com/', 'katori'],
];

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

const [removed] = await connection.execute("DELETE FROM portfolio_items WHERE image_url LIKE '/assets/portfolio/samples/%'");

let added = 0;
let updated = 0;
for (const [index, [service, title, sector, headline, url, image]] of projects.entries()) {
  const values = [service, title, sector, headline, `/assets/portfolio/${image}.png`, index + 1];
  const [existing] = await connection.execute('SELECT id FROM portfolio_items WHERE site_url = ?', [url]);
  if (existing.length) {
    await connection.execute(
      'UPDATE portfolio_items SET service_slug = ?, title = ?, client = ?, summary = ?, image_url = ?, sort_order = ? WHERE id = ?',
      [...values, existing[0].id],
    );
    updated += 1;
  } else {
    await connection.execute(
      'INSERT INTO portfolio_items (service_slug, title, client, summary, image_url, sort_order, site_url, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [...values, url],
    );
    added += 1;
  }
}
console.log(`Removed ${removed.affectedRows} sample projects. Added ${added}, updated ${updated} showcase projects.`);
await connection.end();
