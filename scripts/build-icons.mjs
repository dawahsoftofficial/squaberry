// Draws the Squaberry brand icons in a hand-made marker style and writes them as one SVG sprite.
//   node scripts/build-icons.mjs            -> public/icons.svg + components/brand-icons.ts
//   node scripts/build-icons.mjs --preview out.html   (also writes a preview sheet)
// Each icon is drawn on a 24px grid from a few primitives: a shape gets a brush outline (two
// overlapping tapered strokes), a dark gap and an inset, slightly misregistered fill; `ink` lines
// are carved details in the tile colour; `sq` is the small soft square every icon carries.
// Output is deterministic (seeded by icon name), so re-running only changes edited icons.
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

let seed = 1;
let boil = 0; // extra point jitter for the second "line boil" frame
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const f = (n) => String(Math.round(n * 10) / 10 || 0);
const rad = (d) => (d * Math.PI) / 180;
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

// ---- geometry -------------------------------------------------------------------------------
function arc(cx, cy, r, a0, a1, ry = r) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 12));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    return [cx + r * Math.cos(a), cy + ry * Math.sin(a)];
  });
}
const ring = (cx, cy, r, ry = r) => arc(cx, cy, r, 0, 360, ry).slice(0, -1);
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return [...arc(x + w - r, y + r, r, -90, 0), ...arc(x + w - r, y + h - r, r, 0, 90),
    ...arc(x + r, y + h - r, r, 90, 180), ...arc(x + r, y + r, r, 180, 270)];
}
function star(cx, cy, R, r, n = 4, a0 = -90) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = rad(a0 + (i * 180) / n), k = i % 2 ? r : R;
    return [cx + k * Math.cos(a), cy + k * Math.sin(a)];
  });
}
function heart(cx, cy, s) {
  return Array.from({ length: 36 }, (_, i) => {
    const t = (i / 36) * Math.PI * 2;
    return [cx + s * 16 * Math.sin(t) ** 3, cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
  });
}
function gear(cx, cy, R, r, teeth = 8) {
  const out = [];
  for (let i = 0; i < teeth; i++) {
    const t = (360 / teeth) * i;
    for (const [a, k] of [[-15, r], [-8, R], [8, R], [15, r]]) out.push([cx + k * Math.cos(rad(t + a)), cy + k * Math.sin(rad(t + a))]);
  }
  return out;
}

// Split long edges, keep corners, drop points that crowd each other.
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
// Catmull-Rom through the points, as cubic Béziers in compact relative path syntax.
const q = (n) => Math.round(n * 10);
const num = (t) => (t < 0 ? '-' : '') + String(Math.abs(t) / 10).replace(/^0\./, '.');
const nums = (a) => a.map(num).reduce((s, x) => s + (s && !x.startsWith('-') && !(x.startsWith('.') && /\.\d*$/.test(s)) ? ' ' : '') + x, '');
function smooth(pts, closed) {
  const p = (i) => (closed ? pts[(i + pts.length) % pts.length] : pts[Math.max(0, Math.min(pts.length - 1, i))]);
  let [cx, cy] = [q(pts[0][0]), q(pts[0][1])];
  let d = `M${nums([cx, cy])}c`;
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
function area(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s / 2;
}
function offset(pts, d) {
  const n = pts.length;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], c = pts[(i + 1) % n];
    const e1 = unit(p[0] - a[0], p[1] - a[1]), e2 = unit(c[0] - p[0], c[1] - p[1]);
    const m = unit(-e1[1] - e2[1], e1[0] + e2[0]);
    const cos = m[0] * -e1[1] + m[1] * e1[0];
    const len = Math.min(d / Math.max(cos, 0.4), d * 2.5);
    return [p[0] + m[0] * len, p[1] + m[1] * len];
  });
}
// Shrink a closed shape by d; null when the shape is too thin to hold a fill.
function inset(pts, d) {
  const base = prep(pts, true, 1.2), A0 = area(base);
  const best = [offset(base, d), offset(base, -d)].filter((p) => Math.sign(area(p)) === Math.sign(A0))
    .sort((p, q) => Math.abs(area(p)) - Math.abs(area(q)))[0];
  return best && Math.abs(area(best)) > Math.abs(A0) * 0.06 ? best : null;
}

// ---- marks ----------------------------------------------------------------------------------
// A brush stroke: a filled outline whose width swells in the middle and tapers at both ends.
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
const blob = (pts, { j = 0.07, dx = 0, dy = 0, step = 1.6 } = {}) =>
  smooth(prep(pts, true, step).map(([x, y]) => [x + dx + rnd() * (j + boil), y + dy + rnd() * (j + boil)]), true);

let cur;
const layer = (name, d) => d && cur[name].push(d);
// A closed shape: outline drawn as two overlapping strokes from a random start, plus inset fill.
function shape(pts, { w = 1.5, gap = 1.55, fill = true } = {}) {
  const P = prep(pts, true, 1.6), n = P.length, k = Math.floor(((rnd() + 1) / 2) * n);
  const take = (from, to) => { const o = []; for (let i = Math.round(from); i <= Math.round(to); i++) o.push(P[((i % n) + n) % n]); return o; };
  layer('accent', brush(take(k, k + 0.56 * n), w));
  layer('accent', brush(take(k + 0.5 * n, k + 1.06 * n), w));
  const inner = fill && inset(pts, gap);
  if (inner) layer('fill', blob(inner, { dx: 0.3, dy: 0.25 }));
}
const box = (x, y, w, h, r, o) => shape(rr(x, y, w, h, r), o);
const disc = (cx, cy, r, o) => shape(ring(cx, cy, r), o);
const line = (pts, w = 1.5, o) => layer('accent', brush(pts, w, o));
const flick = (pts, w = 1.6) => line(pts, w, { a: 0.95, b: 0.2 });
const ink = (pts, w = 1, o) => layer('ink', brush(pts, w, { a: 0.5, b: 0.5, ...o }));
const inkShape = (pts) => layer('ink', blob(pts, { j: 0.04 }));
// The signature soft square, tilted a little. 'ink' carves it into a fill, 'top' sits on ink.
function sq(x, y, s, where = 'accent') {
  const c = Math.cos(rad(-8)), si = Math.sin(rad(-8)), h = s / 2;
  const pts = rr(-h, -h, s, s, s * 0.26).map(([px, py]) => [x + px * c - py * si, y + px * si + py * c]);
  layer(where, blob(pts, { j: 0.03, step: Math.max(0.5, s / 4) }));
}
const hand = () => shape([[2.4, 14.6], [6.4, 14.4], [10.4, 16.2], [14.6, 16.2], [19.6, 13.6], [21.4, 15.2], [15.4, 20.8], [2.4, 20.8]]);
const thin = { gap: 1.35 };

// ---- the set (24px grid) ---------------------------------------------------------------------
const icons = {
  // Services
  web() {
    box(2.5, 4, 19, 16, 3.2);
    ink([[4.7, 8.7], [19.3, 8.7]]); sq(6.4, 6.6, 1.3, 'ink');
    ink([[9.6, 11.6], [7.4, 14], [9.6, 16.4]], 1.1); ink([[14.4, 11.6], [16.6, 14], [14.4, 16.4]], 1.1);
  },
  design() {
    shape([[3.6, 20.4], [4.9, 15.4], [15.4, 4.9], [19.1, 8.6], [8.6, 19.1]]);
    ink([[5.9, 15.5], [8.5, 18.1]]); ink([[13.3, 7.6], [16.4, 10.7]]);
    sq(18.4, 18.4, 3.6);
  },
  marketing() {
    shape([[3.3, 9.6], [8.8, 8.8], [15.2, 4.4], [16.9, 4.8], [17.5, 12], [16.9, 19.2], [15.4, 19.6], [8.9, 15.3], [3.3, 14.8]]);
    line([[6.4, 15.6], [7.4, 20], [9.8, 19.9], [9.4, 16.2]], 1.4);
    flick([[19.7, 7.6], [21.8, 5.3]]); flick([[19.7, 16.4], [21.8, 18.7]]); sq(21, 12, 2.6);
    ink([[9.4, 10.4], [9.6, 12.2], [9.4, 13.8]], 1.1); ink([[11.2, 9.6], [13.8, 7.9]], 0.8);
  },
  security() {
    shape([[12, 2.6], [19.7, 5.5], [19.2, 12.6], [12, 21.4], [4.8, 12.6], [4.3, 5.5]]);
    sq(12, 10.4, 3.4, 'ink'); ink([[12, 11.6], [12, 15.6]], 1.6, { a: 0.9, b: 0.6 });
  },
  cloud() {
    shape([...arc(6.8, 14.6, 3.6, 100, 280), ...arc(12.4, 10.6, 5.4, 205, 345), ...arc(17.4, 14.2, 4, 265, 450)]);
    sq(12.2, 13.8, 2.6, 'ink'); ink(arc(12.4, 10.6, 3.2, 215, 265), 0.8);
  },
  automation() {
    shape(gear(12, 12, 9.6, 7.2));
    sq(12, 12, 4.4, 'ink'); ink(arc(12, 12, 4.9, 195, 245), 0.8);
  },
  strategy() {
    disc(12, 12.5, 8.6);
    ink(arc(12, 12.5, 4.4, 20, 340)); sq(12, 12.5, 2.2, 'ink');
    ink([[12.7, 11.8], [16.2, 8.3]], 1.1);
    line([[17.7, 6.8], [20.8, 3.7]], 1.5); line([[18.3, 2.9], [20.9, 3.1], [21.1, 5.7]], 1.4);
  },
  // Footer strip
  apps() {
    box(5.8, 2.5, 12.4, 19, 3.2);
    ink([[10.6, 5.4], [13.4, 5.4]]);
    sq(10.1, 10.4, 2.3, 'ink'); sq(13.9, 10.4, 2.3, 'ink'); sq(10.1, 14.2, 2.3, 'ink'); sq(13.9, 14.2, 2.3, 'ink');
  },
  shop() {
    shape([[4.2, 8.4], [19.8, 8.4], [19, 21], [5, 21]]);
    line(arc(12, 8.6, 3.7, 180, 360), 1.5); sq(12, 14.6, 3, 'ink');
  },
  ui() {
    box(2.5, 3.5, 19, 17, 3.2);
    ink([[8.6, 5.6], [8.6, 18.4]]); ink([[11, 8.4], [18, 8.4]]); ink([[11, 11.6], [15.6, 11.6]]);
    sq(13, 15.8, 2.6, 'ink');
  },
  seo() {
    disc(10, 10, 6.8);
    line([[14.9, 14.9], [20.6, 20.6]], 2.4, { a: 0.7, b: 0.9 });
    ink([[6.6, 12.2], [8.8, 9.8], [10.6, 11.4], [12.6, 9]], 1); sq(13.3, 8.2, 1.6, 'ink');
  },
  content() {
    shape([[5, 2.8], [14.4, 2.8], [19, 7.4], [19, 21.2], [5, 21.2]]);
    ink([[14, 3.6], [14, 7.8], [18.2, 7.8]]); ink([[8.2, 11.6], [15.8, 11.6]]); ink([[8.2, 14.8], [15.8, 14.8]]);
    sq(8.9, 18, 1.6, 'ink'); ink([[11, 18], [15.6, 18]]);
  },
  support() {
    line(arc(12, 12.5, 8, 195, 345), 1.6);
    box(3.2, 12, 4.6, 7.4, 2, thin); box(16.2, 12, 4.6, 7.4, 2, thin);
    line([[18.6, 19.6], [17.6, 21.2], [14.4, 21.4]], 1.3); sq(13, 21.3, 2.2);
  },
  sparkle() {
    shape(star(11.5, 12.6, 9.6, 2.9));
    sq(19.4, 4.6, 2.6); sq(4.8, 19.6, 1.8);
  },
  bolt() {
    shape([[14.2, 2.4], [4.8, 13.6], [11.2, 13.6], [9.4, 21.6], [19.2, 10], [12.8, 10]]);
    sq(19.8, 19.4, 2.6); sq(4.6, 4.6, 1.7);
  },
  // Products
  dumbbell() {
    box(1.6, 9, 2.6, 6, 1.1, { fill: false }); box(19.8, 9, 2.6, 6, 1.1, { fill: false });
    box(4.8, 6.2, 3.8, 11.6, 1.6, thin); box(15.4, 6.2, 3.8, 11.6, 1.6, thin);
    line([[8.8, 12], [15.2, 12]], 1.8); sq(12, 12, 2.8);
  },
  food() {
    shape(arc(12, 11.6, 8.6, 180, 360));
    line([[3.4, 14.4], [5.8, 15.4], [8.2, 14.4], [10.6, 15.4], [13, 14.4], [15.4, 15.4], [17.8, 14.4], [20.6, 15.2]], 1.4);
    box(3.6, 17, 16.8, 4.2, 2, thin);
    sq(8.8, 8.4, 1.3, 'ink'); sq(12.6, 6.6, 1.3, 'ink'); sq(15.6, 9, 1.3, 'ink');
  },
  charity() {
    shape(heart(12, 7.6, 0.34)); hand();
    ink([[8.4, 6.4], [9.2, 5.2]], 0.8); sq(20, 4.4, 2.2);
  },
  whatsapp() {
    shape([...arc(12, 11.4, 8.6, 128, 470), [3.6, 20.8]]);
    inkShape(star(12, 11.4, 4.6, 1.4));
  },
  bot() {
    box(4, 7.4, 16, 12.8, 4);
    line([[12, 7.2], [12, 4.6]], 1.4); sq(12, 3.4, 2.6);
    line([[2, 11.8], [2, 15.6]], 1.6); line([[22, 11.8], [22, 15.6]], 1.6);
    sq(9.2, 12.6, 2.2, 'ink'); sq(14.8, 12.6, 2.2, 'ink'); ink([[9.6, 16.4], [14.4, 16.4]]);
  },
  grid() {
    const g = { gap: 1.4 };
    box(3, 3, 7.8, 7.8, 2.2, g); box(13.2, 3, 7.8, 7.8, 2.2, g); box(3, 13.2, 7.8, 7.8, 2.2, g);
    sq(17.1, 17.1, 7.2);
  },
  // How we work
  discover() {
    disc(12, 12, 9);
    inkShape([[12, 5.6], [14.3, 12], [12, 18.4], [9.7, 12]]); sq(12, 12, 1.8, 'top');
  },
  shape() {
    disc(7.4, 7.6, 4.6, { gap: 1.45 }); box(13.4, 3.2, 7.6, 7.6, 2, { gap: 1.4 });
    shape([[12, 13], [18.4, 21.2], [5.6, 21.2]]);
  },
  build() {
    box(2.8, 12.6, 8.4, 8.4, 2.2); box(12.8, 12.6, 8.4, 8.4, 2.2); box(7.8, 3, 8.4, 8.4, 2.2);
    ink([[10.2, 5.8], [11.8, 4.9]], 0.8);
  },
  evolve() {
    line([[12, 18], [12, 9]], 1.5);
    shape([[11.6, 13], [8, 12.6], [5, 9.6], [4.8, 6], [8.6, 6.6], [11.2, 9.4]]);
    shape([[12.4, 10.6], [13.6, 6.6], [17, 3.8], [20.2, 3.6], [19.8, 7.4], [16.4, 10.2]]);
    box(7.2, 17.2, 9.6, 4.6, 1.6, thin);
    ink([[6.6, 8], [10, 11]], 0.8); ink([[18.6, 5.2], [14.8, 8.6]], 0.8);
  },
  // Product features
  members() {
    disc(9, 7.6, 3.6, { gap: 1.4 }); shape(arc(9, 21.2, 6.8, 180, 360));
    disc(17, 8.2, 2.8, { fill: false }); line(arc(17.6, 20.4, 5.6, 250, 340), 1.5);
  },
  person() {
    disc(12, 7.8, 4.3); shape(arc(12, 21.6, 8, 180, 360)); sq(15.4, 18.2, 1.8, 'ink');
  },
  calendar() {
    box(3, 5, 18, 16, 3);
    line([[8, 2.6], [8, 6.4]], 1.6); line([[16, 2.6], [16, 6.4]], 1.6);
    ink([[5, 9.8], [19, 9.8]]);
    for (const [x, y] of [[8, 13.4], [12, 13.4], [16, 13.4], [8, 17.2], [12, 17.2]]) sq(x, y, 1.7, 'ink');
    sq(16, 17.2, 2.6, 'ink');
  },
  payments() {
    box(2.4, 5.2, 19.2, 13.6, 3);
    ink([[4.2, 9.6], [19.8, 9.6]], 1.8, { a: 0.8, b: 0.8 }); sq(7.6, 14.2, 2.6, 'ink'); ink([[11, 14.4], [16.4, 14.4]]);
  },
  attendance() {
    box(4.4, 4.4, 15.2, 17, 2.8); box(8.4, 2.2, 7.2, 4.2, 1.4, { gap: 1.2 });
    ink([[8.4, 13.2], [11, 15.8], [15.8, 10.6]], 1.3);
  },
  language() {
    disc(12, 12, 9);
    ink(arc(12, 12, 3.8, -80, 262, 7.2), 0.9); ink([[4.6, 12], [19.4, 12]], 0.9); sq(16.4, 7.6, 1.6, 'ink');
  },
  orders() {
    shape([[5, 2.6], [19, 2.6], [19, 21.4], [16.7, 19.9], [14.3, 21.4], [12, 19.9], [9.7, 21.4], [7.3, 19.9], [5, 21.4]]);
    ink([[8.2, 7.4], [15.8, 7.4]]); ink([[8.2, 10.8], [15.8, 10.8]]); ink([[8.2, 14.2], [12.4, 14.2]]);
    sq(15.2, 14.2, 1.8, 'ink');
  },
  menu_items() {
    shape(arc(12, 16.4, 8, 180, 360));
    line([[2.2, 18.6], [21.8, 18.6]], 1.8); sq(12, 6.4, 2.6); ink(arc(12, 16.4, 4.8, 215, 260), 0.8);
  },
  inventory() {
    box(2, 3.4, 20, 5, 1.6, thin); box(3.6, 9.6, 16.8, 11.6, 2);
    ink([[9.6, 12.9], [14.4, 12.9]], 1.2); sq(12, 16.9, 2, 'ink');
  },
  bell() {
    shape([[12, 3], [16.4, 5], [17.4, 9.8], [17.8, 14.2], [20.4, 17.4], [3.6, 17.4], [6.2, 14.2], [6.6, 9.8], [7.6, 5]]);
    sq(12, 20.4, 2.8); ink([[9.6, 7.4], [8.9, 11.2]], 0.9);
  },
  chart() {
    box(2.6, 12.6, 5, 8.6, 1.4, thin); box(9.5, 8.2, 5, 13, 1.4, thin); box(16.4, 3.4, 5, 17.8, 1.4, thin);
  },
  handover() {
    hand(); box(7.8, 4.2, 8.4, 8.4, 2); ink([[12, 5.8], [12, 10.4]]);
  },
  calculator() {
    box(4.4, 2.4, 15.2, 19.2, 3);
    ink([[7.4, 6.6], [16.6, 6.6]], 2, { a: 0.9, b: 0.9 });
    for (const y of [11.2, 14.8, 18.4]) for (const x of [8.6, 12, 15.4]) sq(x, y, 1.8, 'ink');
  },
  funds() {
    disc(15.6, 8.4, 5.6); sq(15.6, 8.4, 2.4, 'ink');
    box(2.4, 14.2, 10.6, 3.2, 1.6, { gap: 1.2 }); box(2.4, 18.4, 10.6, 3.2, 1.6, { gap: 1.2 });
  },
  import() {
    shape([[2.8, 13.6], [7.2, 13.6], [8.6, 16.4], [15.4, 16.4], [16.8, 13.6], [21.2, 13.6], [21.2, 21], [2.8, 21]]);
    line([[12, 2.6], [12, 11.6]], 1.7); line([[8.2, 8], [12, 11.8], [15.8, 8]], 1.7);
  },
  'gift-aid'() {
    box(2.4, 7.6, 19.2, 4.8, 1.5, thin); box(4, 13.4, 16, 8, 2);
    ink([[12, 8.8], [12, 11.2]], 1.4); ink([[12, 14.8], [12, 20.2]], 1.4);
    line([[11.4, 7], [8.6, 3.6], [6.2, 4.6], [7.6, 7.2]], 1.3); line([[12.6, 7], [15.4, 3.6], [17.8, 4.6], [16.4, 7.2]], 1.3);
    sq(12, 6.4, 2.2);
  },
  // Contact
  mail() {
    box(2.4, 5, 19.2, 14, 3);
    ink([[4.8, 7.6], [12, 12.8], [19.2, 7.6]], 1.1); sq(17, 15.6, 1.8, 'ink');
  },
  chat() {
    shape([[3, 4.4], [21, 4.4], [21, 16.6], [10.6, 16.6], [5.6, 20.8], [6.4, 16.6], [3, 16.6]]);
    sq(8, 10.5, 1.7, 'ink'); sq(12, 10.5, 1.7, 'ink'); sq(16, 10.5, 1.7, 'ink');
  },
};

// ---- output -----------------------------------------------------------------------------------
// Every icon is drawn twice: frame a, and frame b from another seed with a little more jitter.
// The site flicks between them (a two-frame "line boil"); frame a is the still icon.
const BOIL = Number(process.env.ICON_BOIL ?? 0.14);
const draw = (name, key, extra) => {
  seed = (parseInt(createHash('md5').update(key).digest('hex').slice(0, 8), 16) % 2147483646) + 1;
  boil = extra;
  cur = { fill: [], accent: [], ink: [], top: [] };
  icons[name]();
  const p = (d, ink) => d.length ? `<path ${ink ? 'style="fill:var(--icon-ink,#1c1c1c)"' : 'fill="currentColor"'} d="${d.join('')}"/>` : '';
  return `${p(cur.fill)}${p(cur.accent)}${p(cur.ink, true)}${p(cur.top)}`;
};
const symbols = Object.keys(icons).map((name) =>
  `<symbol id="${name}" viewBox="0 0 24 24">${draw(name, name, 0)}</symbol>` +
  `<symbol id="${name}-b" viewBox="0 0 24 24">${draw(name, `${name}~b`, BOIL)}</symbol>`);
const sprite = `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`;
const version = createHash('md5').update(sprite).digest('hex').slice(0, 8);
const root = new URL('..', import.meta.url);
writeFileSync(new URL('public/icons.svg', root), sprite);
writeFileSync(new URL('components/brand-icons.ts', root),
  `// Generated by scripts/build-icons.mjs: do not edit. The drawings live in that script.\n` +
  `export const brandIconVersion = '${version}';\n` +
  `export const brandIcons: ReadonlySet<string> = new Set(${JSON.stringify(Object.keys(icons))});\n`);
console.log(`icons.svg: ${Object.keys(icons).length} icons, ${(sprite.length / 1024).toFixed(1)} KB, v${version}`);

const previewAt = process.argv.indexOf('--preview');
if (previewAt > 0) {
  const accents = ['#b3a8ff', '#8fd3e8', '#ff9ed2', '#ffb38a', '#9fe6b8', '#f5a8d4', '#86b4ff'];
  const use = (n, s) => `<svg width="${s}" height="${s}"><use href="#${n}"/></svg>`;
  const cells = Object.keys(icons).map((n, i) => `<div class="c" style="--accent:${accents[i % 7]}">
    <div class="r">${use(n, 26)}${use(n, 36)}${use(n, 56)}</div>
    <div class="r"><span class="t1">${use(n, 34)}</span><span class="t2">${use(n, 38)}</span><span class="t3">${use(n, 36)}</span></div><code>${n}</code></div>`).join('');
  writeFileSync(process.argv[previewAt + 1], `<!doctype html><meta charset="utf-8"><title>Squaberry icons</title><style>
body{margin:0;padding:24px;background:#1c1c1c;color:#fffffd;font:13px system-ui}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.c{background:#272727;border-radius:18px;padding:14px;display:grid;gap:12px;color:var(--accent)}
.r{display:flex;gap:12px;align-items:center}.r span{display:grid;place-items:center}
.t1{width:56px;height:56px;border-radius:14px;background:color-mix(in srgb,var(--accent) 18%,#272727);--icon-ink:color-mix(in srgb,var(--accent) 18%,#272727)}
.t2{width:64px;height:64px;border-radius:18px;background:linear-gradient(150deg,color-mix(in srgb,var(--accent) 92%,#fff),var(--accent) 45%,color-mix(in srgb,var(--accent) 62%,#1c1c1c));color:#1a1a1a;--icon-ink:var(--accent)}
.t3{width:60px;height:60px;border-radius:16px;background:#1a1a1a;--icon-ink:#1a1a1a}code{color:#bdbdbd}
</style><div style="position:absolute;width:0;height:0;overflow:hidden">${sprite}</div><div class="g">${cells}</div>`);
}
