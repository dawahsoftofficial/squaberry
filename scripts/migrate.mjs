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
const [tables] = await connection.query('SHOW TABLES');
console.log('Schema applied. Tables:', tables.map(row => Object.values(row)[0]).join(', '));
await connection.end();
