// Applies db/schema.sql to the database configured in the environment (.env.local or .env).
// Usage: npm run db:migrate
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const caPath = process.env.DB_CA_CERT_PATH;
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: caPath ? { ca: readFileSync(caPath, 'utf8') } : { rejectUnauthorized: false },
  multipleStatements: true,
  connectTimeout: 15000,
});

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
await connection.query(schema);

// CREATE TABLE IF NOT EXISTS leaves existing tables alone, so columns added since a table was
// first created are added here (MySQL 8 has no ADD COLUMN IF NOT EXISTS).
const addedColumns = {
  portfolio_items: [
    ['slug', 'VARCHAR(140) NULL AFTER image_url'],
    ['intro', 'VARCHAR(600) NULL AFTER slug'],
    ['scope', 'VARCHAR(600) NULL AFTER intro'],
    ['overview', 'TEXT NULL AFTER scope'],
    ['challenge', 'TEXT NULL AFTER overview'],
    ['solution', 'TEXT NULL AFTER challenge'],
    ['results', 'TEXT NULL AFTER solution'],
    ['gallery', 'TEXT NULL AFTER results'],
    ['quote', 'TEXT NULL AFTER gallery'],
    ['quote_name', 'VARCHAR(120) NULL AFTER quote'],
    ['quote_role', 'VARCHAR(120) NULL AFTER quote_name'],
  ],
};
for (const [table, columns] of Object.entries(addedColumns)) {
  const [existing] = await connection.query(
    'SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [table],
  );
  const have = new Set(existing.map(row => row.name));
  for (const [name, definition] of columns) {
    if (have.has(name)) continue;
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${name}\` ${definition}`);
    console.log(`Added ${table}.${name}`);
  }
}
const [indexes] = await connection.query("SHOW INDEX FROM portfolio_items WHERE Key_name = 'uniq_portfolio_slug'");
if (!indexes.length) {
  await connection.query('ALTER TABLE portfolio_items ADD UNIQUE KEY uniq_portfolio_slug (slug)');
  console.log('Added unique index on portfolio_items.slug');
}

const [tables] = await connection.query('SHOW TABLES');
console.log('Schema applied. Tables:', tables.map(row => Object.values(row)[0]).join(', '));
await connection.end();
