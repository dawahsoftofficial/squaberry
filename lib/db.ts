import 'server-only';
import { readFileSync } from 'node:fs';
import mysql, { type Pool } from 'mysql2/promise';

// One pool per server process (kept on globalThis so dev hot reloads don't open new pools).
const globalForDb = globalThis as unknown as { squaberryPool?: Pool };

function createPool(): Pool {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_CA_CERT_PATH } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Database is not configured: set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME.');
  }
  return mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    // DigitalOcean requires TLS. With the CA certificate the server identity is verified too.
    ssl: DB_CA_CERT_PATH ? { ca: readFileSync(DB_CA_CERT_PATH, 'utf8') } : { rejectUnauthorized: false },
    connectionLimit: 5,
    connectTimeout: 15000,
    dateStrings: false,
    timezone: 'Z',
  });
}

export function db(): Pool {
  globalForDb.squaberryPool ??= createPool();
  return globalForDb.squaberryPool;
}
