// Draws the Squaberry logo (the "Stamped" Pop mark) in the same hand-made style as the icon set and
// writes every logo file the site uses.
//   node scripts/build-logo.mjs   (npm run logo:build)
// Writes:
//   public/assets/squaberry-logo-boil.svg   lock-up for dark backgrounds (header, footer, admin), boiling
//   public/assets/squaberry-mark-boil.svg   mark on its own, tight to the drawing (admin), boiling
//   public/assets/squaberry-logo-hand.svg, squaberry-mark-hand.svg   the same, still (reduced motion)
//   app/icon.svg, app/favicon.ico, app/apple-icon.png, public/icon-hand-192.png, public/icon-hand-512.png
//   design/logo-concepts/final/             lock-ups and marks for dark and light, favicon, 512px app icon
// The mark is five of the icon set's signature soft squares (3-2-1, the top-right one popped out as a
// leaf), drawn on the icons' 24px grid with the same wobble; the brush primitives below are copied from
// scripts/build-icons.mjs (which writes files when imported). The wordmark is the Fraunces outline in
// design/logo-concepts/wordmark-fraunces.svg. Output is deterministic. Give changed files new names:
// the CDN caches /assets for a year.
// Like the icons, the site's mark "boils": the two files above hold two hand-drawn frames of the mark
// (frame b from another seed with a little more jitter) and flick between them at 2.5 frames a second
// with CSS inside the SVG. components/Logo.tsx shows them and swaps in the still -hand files under
// reduced motion (the SVG's own media query isn't reliably applied inside an <img>).
// The wordmark stays still. Favicons, app icons and design/logo-concepts/final/ are frame a only.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const file = (p) => new URL(p, root);

// ---- primitives (from scripts/build-icons.mjs) -----------------------------------------------
let seed = 1;
let boil = 0; // extra point jitter for the second frame, as in build-icons.mjs
const BOIL = 0.14;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const reseed = (s) => { seed = (parseInt(createHash('md5').update(s).digest('hex').slice(0, 8), 16) % 2147483646) + 1; };
const rad = (d) => (d * Math.PI) / 180;
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
function arc(cx, cy, r, a0, a1, ry = r) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 12));
  return Array.from({ length: n + 1 }, (_, i) => { const a = rad(a0 + ((a1 - a0) * i) / n); return [cx + r * Math.cos(a), cy + ry * Math.sin(a)]; });
}
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return [...arc(x + w - r, y + r, r, -90, 0), ...arc(x + w - r, y + h - r, r, 0, 90),
    ...arc(x + r, y + h - r, r, 90, 180), ...arc(x + r, y + r, r, 180, 270)];
}
const turn = (pts, cx, cy, deg) => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
};
function prep(pts, closed, step) {
  const sub = [];
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const k = Math.max(1, Math.round(dist(a, b) / step));
    for (let j = 0; j < k; j++) sub.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) sub.push(pts[pts.length - 1]);
  const out = [sub[0]];
  for (let i = 1; i < sub.length; i++) {
    const last = !closed && i === sub.length - 1;
    if (dist(out[out.length - 1], sub[i]) >= step * 0.55) out.push(sub[i]);
    else if (last) out[out.length - 1] = sub[i];
  }
  if (closed && out.length > 3 && dist(out[out.length - 1], out[0]) < step * 0.55) out.pop();
  if (!closed && out.length === 2) out.splice(1, 0, [(out[0][0] + out[1][0]) / 2, (out[0][1] + out[1][1]) / 2]);
  return out;
}
let bounds; // [minX, minY, maxX, maxY] of everything drawn
const q = (n) => Math.round(n * 100);
const num = (t) => (t < 0 ? '-' : '') + String(Math.abs(t) / 100).replace(/^0\./, '.');
const nums = (a) => a.map(num).reduce((s, x) => s + (s && !x.startsWith('-') && !(x.startsWith('.') && /\.\d*$/.test(s)) ? ' ' : '') + x, '');
function smooth(pts, closed) {
  for (const [x, y] of pts) bounds = [Math.min(bounds[0], x), Math.min(bounds[1], y), Math.max(bounds[2], x), Math.max(bounds[3], y)];
  const p = (i) => (closed ? pts[(i + pts.length) % pts.length] : pts[Math.max(0, Math.min(pts.length - 1, i))]);
  let [cx, cy] = [q(pts[0][0]), q(pts[0][1])];
  const d = `M${nums([cx, cy])}c`;
  const n = closed ? pts.length : pts.length - 1;
  const segs = [];
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const abs = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]].map(q);
    segs.push(...abs.map((v, k) => v - (k % 2 ? cy : cx)));
    [cx, cy] = [abs[4], abs[5]];
  }
  return d + nums(segs) + (closed ? 'z' : '');
}
function brush(pts, w, { a = 0.35, b = 0.45, j = 0.06, step = 1.6 } = {}) {
  const s = prep(pts, false, step).map(([x, y]) => [x + rnd() * (j + boil), y + rnd() * (j + boil)]);
  const n = s.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const p0 = s[Math.max(0, i - 1)], p1 = s[Math.min(n - 1, i + 1)];
    const [nx, ny] = unit(-(p1[1] - p0[1]), p1[0] - p0[0]);
    const t = i / (n - 1), sn = Math.sin(Math.PI * t);
    const hw = (w / 2) * (t < 0.5 ? a + (1 - a) * sn : b + (1 - b) * sn) * (1 + rnd() * 0.06);
    L.push([s[i][0] + nx * hw, s[i][1] + ny * hw]);
    R.push([s[i][0] - nx * hw, s[i][1] - ny * hw]);
  }
  return smooth([...L, ...R.reverse()], true);
}
const blob = (pts, { j = 0.07, step = 1.6 } = {}) => smooth(prep(pts, true, step).map(([x, y]) => [x + rnd() * (j + boil), y + rnd() * (j + boil)]), true);

// ---- the mark (24px grid) --------------------------------------------------------------------
const PALETTES = {
  // squares lavender to violet, then the leaf; `cut` is the background the carved details show
  dark: { squares: ['#C9C0FF', '#B3A8FF', '#9C8CFB', '#8B73F9', '#7C55F7'], leaf: '#E6E1FF', cut: '#1C1C1C' },
  light: { squares: ['#9C8CFB', '#8B73F9', '#7C55F7', '#6A5BB5', '#4E3F96'], leaf: '#B3A8FF', cut: '#F9F8F3' },
};
const softSq = (cx, cy, s, tilt) => turn(rr(cx - s / 2, cy - s / 2, s, s, s * 0.27), cx, cy, tilt);
// The leaf: a square with two opposite corners fully rounded, tip pointing up and out.
function leaf(cx, cy, s, tilt) {
  const h = s / 2, rb = h * 0.95, rs = s * 0.12;
  return turn([...arc(cx + h - rs, cy - h + rs, rs, -90, 0), ...arc(cx + h - rb, cy + h - rb, rb, 0, 90),
    ...arc(cx - h + rs, cy + h - rs, rs, 90, 180), ...arc(cx - h + rb, cy - h + rb, rb, 180, 270)], cx, cy, tilt);
}
// small: the favicon cut, with bigger squares, a bigger leaf and no carved highlights so it holds at 16px.
function drawMark(mode, small = false, frame = 'a') {
  const pal = PALETTES[mode];
  reseed(`stamped${small ? '-s' : ''}${frame === 'b' ? '~b' : ''}`);
  boil = frame === 'b' ? BOIL : 0;
  bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const layers = [];
  const put = (fill, d) => { const last = layers[layers.length - 1]; if (last?.fill === fill) last.d.push(d); else layers.push({ fill, d: [d] }); };
  const s = small ? 6.4 : 5.5, pitch = small ? 7.2 : 6.5, y0 = small ? 6.6 : 7.6;
  const tilts = [-7, 4, -3, 6, -5];
  // 3-2-1 rows centred on x 12, minus the top-right square (it pops out as the leaf)
  const centres = [[12 - pitch, y0], [12, y0], [12 - pitch / 2, y0 + pitch], [12 + pitch / 2, y0 + pitch], [12, y0 + 2 * pitch]];
  centres.forEach(([x, y], i) => {
    put(pal.squares[i], blob(softSq(x, y, s, tilts[i]), { j: 0.1, step: Math.max(0.6, s / 4.5) }));
    if (!small) put(pal.cut, brush(turn(arc(x - 0.1, y - 0.1, s * 0.27, 200, 255), x, y, tilts[i]), 0.55, { a: 0.6, b: 0.4, step: 0.5 }));
  });
  const [lx, ly, ls] = small ? [19.4, 2.9, 5.6] : [18.6, 3.6, 4.6];
  put(pal.leaf, blob(leaf(lx, ly, ls, -6), { j: 0.05, step: 0.8 }));
  put(pal.cut, brush([[lx - ls * 0.28, ly + ls * 0.28], [lx + ls * 0.22, ly - ls * 0.22]], small ? 0.7 : 0.55, { a: 0.4, b: 0.9, step: 0.6 }));
  const pad = 0.15;
  return { body: layers.map((l) => `<path fill="${l.fill}" d="${l.d.join('')}"/>`).join(''),
    box: [bounds[0] - pad, bounds[1] - pad, bounds[2] + pad, bounds[3] + pad] };
}

// ---- files -----------------------------------------------------------------------------------
const r2 = (n) => Math.round(n * 100) / 100;
const TITLE = '<title>Squaberry</title>';
const INK = { dark: '#FFFFFD', light: '#1C1C1C' };
const wordPath = readFileSync(file('design/logo-concepts/wordmark-fraunces.svg'), 'utf8').match(/<path [^>]*\/>/)[0];

// The mark's drawing: frame a alone, or both frames with the boil (box covers both frames).
const BOIL_CSS = '<style>.b{opacity:0}.f{animation:boil .8s steps(2,jump-none) infinite}.a{animation-direction:reverse}' +
  '@keyframes boil{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.f{animation:none}}</style>';
function mark(mode, animated) {
  const a = drawMark(mode);
  if (!animated) return a;
  const b = drawMark(mode, false, 'b');
  const box = [Math.min(a.box[0], b.box[0]), Math.min(a.box[1], b.box[1]), Math.max(a.box[2], b.box[2]), Math.max(a.box[3], b.box[3])];
  return { box, style: BOIL_CSS, body: `<g class="f a">${a.body}</g><g class="f b">${b.body}</g>` };
}
function markSvg(mode, animated = false) {
  const { body, style = '', box: [x0, y0, x1, y1] } = mark(mode, animated);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(x0)} ${r2(y0)} ${r2(x1 - x0)} ${r2(y1 - y0)}" role="img">${TITLE}${style}${body}</svg>\n`;
}
// Lock-up in the wordmark's units: the mark fills the 85.5-unit height, its right edge 37.5 units
// before the word (the spacing of the previous logo).
function lockupSvg(mode, animated = false) {
  const { body, style = '', box: [x0, y0, x1, y1] } = mark(mode, animated);
  const k = 85.5 / (y1 - y0), tx = 84.5 - x1 * k, ty = 9.5 - y0 * k, left = tx + x0 * k;
  const word = wordPath.replace(/fill="[^"]*"/, `fill="${INK[mode]}"`);
  return { ratio: (381.18 - left) / 85.5,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(left)} 9.5 ${r2(381.18 - left)} 85.5" role="img">${TITLE}${style}` +
      `<g transform="translate(${r2(tx)} ${r2(ty)}) scale(${r2(k)})">${body}</g>${word}</svg>\n` };
}
// Charcoal tile with the mark centred on its drawn shape; `fill` is the share of the tile the mark's
// longer side takes, so the padding is even on every side.
function iconSvg(size, fill, { rx = 0, small = true } = {}) {
  const { body, box: [x0, y0, x1, y1] } = drawMark('dark', small);
  const k = (size * fill) / Math.max(x1 - x0, y1 - y0);
  const tile = `<rect width="${size}" height="${size}"${rx ? ` rx="${rx}"` : ''} fill="#1C1C1C"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${tile}` +
    `<g transform="translate(${r2(size / 2 - ((x0 + x1) / 2) * k)} ${r2(size / 2 - ((y0 + y1) / 2) * k)}) scale(${r2(k)})">${body}</g></svg>\n`;
}
const png = (svg, px) => sharp(Buffer.from(svg.replace('<svg ', `<svg width="${px}" height="${px}" `))).png().toBuffer();
// .ico holding PNG images (supported by every current browser).
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(1, 2); head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ px, buf }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(px % 256, e); head.writeUInt8(px % 256, e + 1);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...images.map((x) => x.buf)]);
}

const dark = lockupSvg('dark');
const live = lockupSvg('dark', true);
writeFileSync(file('public/assets/squaberry-logo-boil.svg'), live.svg);
writeFileSync(file('public/assets/squaberry-mark-boil.svg'), markSvg('dark', true));
writeFileSync(file('public/assets/squaberry-logo-hand.svg'), dark.svg);
writeFileSync(file('public/assets/squaberry-mark-hand.svg'), markSvg('dark'));
writeFileSync(file('design/logo-concepts/final/squaberry-logo-dark.svg'), dark.svg);
writeFileSync(file('design/logo-concepts/final/squaberry-logo-light.svg'), lockupSvg('light').svg);
writeFileSync(file('design/logo-concepts/final/squaberry-mark-dark.svg'), markSvg('dark'));
writeFileSync(file('design/logo-concepts/final/squaberry-mark-light.svg'), markSvg('light'));

// Favicon: rounded tile with the chunkier small cut. App icons are full-bleed (iOS and Android mask
// the corners) with the mark inside the safe zone.
const fav = iconSvg(64, 0.74, { rx: 15 });
writeFileSync(file('app/icon.svg'), fav);
writeFileSync(file('design/logo-concepts/final/favicon.svg'), fav);
writeFileSync(file('app/favicon.ico'), ico(await Promise.all([16, 32, 48].map(async (px) => ({ px, buf: await png(fav, px) })))));
writeFileSync(file('app/apple-icon.png'), await png(iconSvg(180, 0.64), 180));
for (const px of [192, 512]) writeFileSync(file(`public/icon-hand-${px}.png`), await png(iconSvg(px, 0.54, { small: false }), px));
writeFileSync(file('design/logo-concepts/final/app-icon-512.png'), await png(iconSvg(512, 0.54, { small: false }), 512));
console.log(`logo: lock-up ratio ${dark.ratio.toFixed(4)}, boiling ${live.ratio.toFixed(4)} (width / height)`);
