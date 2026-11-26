// Uploads the site's media to DigitalOcean Spaces, where the site serves it from (NEXT_PUBLIC_MEDIA_URL).
//
//   npm run media:upload            upload new or changed files
//   npm run media:upload -- --force upload everything again
//
// Every file in public/assets and public/og goes to <bucket>/<SPACES_PREFIX>/<same path>, e.g.
// public/assets/portfolio/katori.png -> squaberry/assets/portfolio/katori.png. Each raster image under
// public/assets also gets resized WebP copies next to it (katori.w640.webp, katori.w1080.webp, ...) at
// the widths in lib/media.mjs; the site's image loader (lib/image-loader.ts) picks the right one.
//
// Files are public-read with a one-year cache, so give a replaced image a new file name rather than
// overwriting it. Unchanged files are skipped (a hash of the source is stored with each object).
// Needs SPACES_ENDPOINT, SPACES_REGION, SPACES_BUCKET, SPACES_PREFIX, SPACES_KEY and SPACES_SECRET.

import { createHash, createHmac } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { imageWidths, variantPath, webpQuality } from '../lib/media.mjs';

const env = name => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set (see .env.example).`);
  return value;
};
const endpoint = new URL(env('SPACES_ENDPOINT'));
const region = env('SPACES_REGION');
const bucket = env('SPACES_BUCKET');
const prefix = env('SPACES_PREFIX').replace(/^\/+|\/+$/g, '');
const accessKey = env('SPACES_KEY');
const secretKey = env('SPACES_SECRET');
const force = process.argv.includes('--force');
const host = `${bucket}.${endpoint.host}`;

const publicDir = path.join(process.cwd(), 'public');
const sources = ['assets', 'og'];
const rasters = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };
const cacheControl = 'public, max-age=31536000, immutable';

// --- AWS Signature V4 (Spaces speaks the S3 API) ---------------------------------------------------
const sha256 = data => createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();
const encodeKey = key => key.split('/').map(part => encodeURIComponent(part).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)).join('/');

async function request(method, key, { body = Buffer.alloc(0), headers = {} } = {}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const day = amzDate.slice(0, 8);
  const uri = `/${encodeKey(key)}`;
  const payloadHash = sha256(body);
  const all = { ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)])), host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate };
  const names = Object.keys(all).sort();
  const canonical = [method, uri, '', ...names.map(n => `${n}:${all[n].trim()}`), '', names.join(';'), payloadHash].join('\n');
  const scope = `${day}/${region}/s3/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonical)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, day), region), 's3'), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(toSign).digest('hex');
  const { host: _host, ...sendHeaders } = all;
  sendHeaders.authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`;
  return fetch(`https://${host}${uri}`, { method, headers: sendHeaders, body: method === 'PUT' ? body : undefined });
}

async function upToDate(key, hash) {
  if (force) return false;
  const response = await request('HEAD', key);
  return response.ok && response.headers.get('x-amz-meta-source-sha256') === hash;
}

async function put(key, body, type, hash) {
  const response = await request('PUT', key, {
    body,
    headers: { 'content-type': type, 'cache-control': cacheControl, 'x-amz-acl': 'public-read', 'x-amz-meta-source-sha256': hash },
  });
  if (!response.ok) throw new Error(`${key}: ${response.status} ${await response.text()}`);
}

// --- Work list ---------------------------------------------------------------------------------------
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(entries.map(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return files.flat();
}

const files = (await Promise.all(sources.map(source => walk(path.join(publicDir, source))))).flat();
const jobs = [];
for (const file of files) {
  const sitePath = `/${path.relative(publicDir, file).split(path.sep).join('/')}`; // e.g. /assets/portfolio/katori.png
  const ext = path.extname(file).toLowerCase();
  if (!types[ext]) continue;
  jobs.push({ file, sitePath, ext, variant: null });
  if (rasters.has(ext) && sitePath.startsWith('/assets/')) {
    for (const width of imageWidths) jobs.push({ file, sitePath, ext, variant: width });
  }
}

let uploaded = 0;
let skipped = 0;
const failures = [];
const sourceCache = new Map();
async function run(job) {
  if (!sourceCache.has(job.file)) {
    const data = await readFile(job.file);
    sourceCache.set(job.file, { data, hash: sha256(data) });
  }
  const { data, hash } = sourceCache.get(job.file);
  const sitePath = job.variant ? variantPath(job.sitePath, job.variant) : job.sitePath;
  const key = `${prefix}${sitePath}`;
  const versionHash = job.variant ? `${hash}:w${job.variant}:q${webpQuality}` : hash;
  if (await upToDate(key, versionHash)) { skipped++; return; }
  const body = job.variant
    ? await sharp(data).rotate().resize({ width: job.variant, withoutEnlargement: true }).webp({ quality: webpQuality, effort: 5 }).toBuffer()
    : data;
  await put(key, body, job.variant ? 'image/webp' : types[job.ext], versionHash);
  uploaded++;
  if (uploaded % 25 === 0) console.log(`  ${uploaded} uploaded…`);
}

console.log(`Uploading ${jobs.length} files to ${bucket}/${prefix} (${force ? 'all' : 'new or changed only'})…`);
const queue = [...jobs];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const job = queue.shift();
    try { await run(job); } catch (error) { failures.push(`${job.sitePath}${job.variant ? ` @${job.variant}` : ''}: ${error.message}`); }
  }
}));
console.log(`Done: ${uploaded} uploaded, ${skipped} unchanged, ${failures.length} failed.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
