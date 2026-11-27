"""Builds the Squaberry logo concept SVGs and the review page (index.html).

Run from the repo root:  python design/logo-concepts/build.py
Needs fontTools + brotli (to outline the Bricolage Grotesque wordmarks from fonts/bricolage-latin.woff2).
Everything is hand-built geometry: no image generation.
"""
import base64
import html
import math
import os
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
OUT = HERE  # where build_files() writes; build_drupe.py points it at drupe/
SECTION_LABEL = "Direction"
FONT = TTFont(HERE / "fonts" / "bricolage-latin.woff2")
CMAP = FONT.getBestCmap()
UPM = FONT["head"].unitsPerEm

BRAND = [(0, "#3D72F5"), (0.38, "#7C55F7"), (0.72, "#D4479C"), (1, "#F58A3D")]
CHARCOAL = "#1C1C1C"
CREAM = "#F9F8F3"
LAV = "#B3A8FF"
VIOLET = "#6A5BB5"
WHITE = "#FFFFFD"


def f(n):
    """Compact number formatting for path data."""
    s = f"{n:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def lin(gid, x1, y1, x2, y2, stops=BRAND):
    st = "".join(f'<stop offset="{f(o)}" stop-color="{c}"/>' for o, c in stops)
    return (f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{f(x1)}" y1="{f(y1)}" '
            f'x2="{f(x2)}" y2="{f(y2)}">{st}</linearGradient>')


def rrect(cx, cy, s, r, fill, extra=""):
    return (f'<rect x="{f(cx - s / 2)}" y="{f(cy - s / 2)}" width="{f(s)}" height="{f(s)}" rx="{f(r)}" '
            f'fill="{fill}"{extra}/>')


# ---------------------------------------------------------------------------
# Marks. Each takes (p, mode): p is a unique id prefix, mode is one of
#   "dark"  - full colour for charcoal backgrounds
#   "light" - full colour for cream backgrounds
#   "mono"  - single ink, passed as ink=
#   "small" - simplified for favicons (colour, any background)
# and returns the inner SVG markup for a 0 0 100 100 viewBox.
# ---------------------------------------------------------------------------

def mark_drupe(p, mode="dark", ink=WHITE, small=False):
    """A berry built from soft squares, like drupelets; squares shrink toward the edge so it reads as a sphere."""
    out = []
    defs = ""
    if mode != "mono":
        defs = lin(f"{p}g", 18, 14, 84, 96)
        fill = f"url(#{p}g)"
        leaf = LAV if mode == "dark" else VIOLET
    else:
        fill = leaf = ink
    if small:
        rows, pitch, y0, smax = [2, 3, 2, 1], 21, 27, 18.5
        sphere = 0.12
    else:
        rows, pitch, y0, smax = [4, 5, 4, 3, 2, 1], 14, 24, 12.2
        sphere = 0.34
    cy_mid = y0 + pitch * (len(rows) - 1) * 0.42
    for r, n in enumerate(rows):
        cy = y0 + r * pitch
        for i in range(n):
            cx = 50 + (i - (n - 1) / 2) * pitch
            d = math.hypot(cx - 50, cy - cy_mid) / 44
            s = smax * (1 - sphere * d * d)
            out.append(rrect(cx, cy, s, s * 0.3, fill))
    # Leaf: two soft diamonds above the crown.
    if small:
        out.append(f'<g transform="translate(50 10) rotate(45)">{rrect(0, 0, 11, 3, leaf)}</g>')
    else:
        for lx, rot in ((43.6, 30), (56.4, 60)):
            out.append(f'<g transform="translate({lx} 10.5) rotate({rot})">{rrect(0, 0, 8.6, 2.4, leaf)}</g>')
    return (f"<defs>{defs}</defs>" if defs else "") + "".join(out)


def trace_path():
    r = 13
    return (f"M78 20H{35}A{r} {r} 0 0 0 22 33V37A{r} {r} 0 0 0 35 50H65A{r} {r} 0 0 1 78 63V67"
            f"A{r} {r} 0 0 1 65 80H22")


def mark_trace(p, mode="dark", ink=WHITE, small=False, animate=False):
    """One continuous line: it leaves a square, folds into an S and lands on a round berry."""
    defs = ""
    if mode != "mono":
        defs = lin(f"{p}g", 84, 14, 16, 86)
        paint = f"url(#{p}g)"
    else:
        paint = ink
    sw = 15 if small else 11.5
    pad = 21 if small else 17
    dot = 11.5 if small else 9.5
    cls = ' class="trace-line"' if animate else ""
    line = (f'<path{cls} d="{trace_path()}" pathLength="100" fill="none" stroke="{paint}" '
            f'stroke-width="{sw}" stroke-linejoin="round"/>')
    sq = rrect(80, 20, pad, pad * 0.28, paint, ' class="trace-start"' if animate else "")
    berry = f'<circle{" class=\"trace-end\"" if animate else ""} cx="21" cy="80" r="{dot}" fill="{paint}"/>'
    return (f"<defs>{defs}</defs>" if defs else "") + line + sq + berry


def _rhombus(pts, k):
    cx = sum(x for x, _ in pts) / 4
    cy = sum(y for _, y in pts) / 4
    return [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in pts]


def _poly(pts, fill, sw, extra=""):
    d = "M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts) + "Z"
    return (f'<path d="{d}" fill="{fill}" stroke="{fill}" stroke-width="{f(sw)}" '
            f'stroke-linejoin="round"{extra}/>')


def mark_prism(p, mode="dark", ink=WHITE, small=False):
    """A soft isometric cube: the square made dimensional, with the berry's two leaves on top."""
    if small:
        cx, cy, R, gap, sw = 50, 52, 45, 4.2, 7
    else:
        cx, cy, R, gap, sw = 50, 60, 34, 2.4, 5.5
    h = R * math.cos(math.radians(30))
    top, ur, lr = (cx, cy - R), (cx + h, cy - R / 2), (cx + h, cy + R / 2)
    bot, ll, ul, c = (cx, cy + R), (cx - h, cy + R / 2), (cx - h, cy - R / 2), (cx, cy)
    inr = R * math.sin(math.radians(60)) / 2
    k = 1 - (gap + sw / 2) / inr
    faces = {
        "top": _rhombus([top, ur, c, ul], k),
        "left": _rhombus([ul, c, bot, ll], k),
        "right": _rhombus([c, ur, lr, bot], k),
    }
    out = []
    defs = ""
    if mode == "mono":
        for name in ("top", "left", "right"):
            out.append(_poly(faces[name], ink, sw))
        leaf = ink
    else:
        defs = (lin(f"{p}t", cx - h, cy - R / 2, cx + h, cy - R / 2,
                    [(0, "#5B86FF"), (1, "#9A7BFF")])
                + lin(f"{p}l", cx - h, cy - R / 2, cx, cy + R, [(0, "#7C55F7"), (1, "#D4479C")])
                + lin(f"{p}r", cx, cy, cx + h, cy + R / 2, [(0, "#D4479C"), (1, "#F58A3D")])
                + f'<linearGradient id="{p}h" gradientUnits="userSpaceOnUse" x1="{f(cx)}" y1="{f(cy - R)}" '
                  f'x2="{f(cx)}" y2="{f(cy)}"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/>'
                  f'<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>')
        out.append(_poly(faces["top"], f"url(#{p}t)", sw))
        out.append(_poly(faces["left"], f"url(#{p}l)", sw))
        out.append(_poly(faces["right"], f"url(#{p}r)", sw))
        # Glass sheen on the lid.
        out.append(_poly(faces["top"], f"url(#{p}h)", sw, ' opacity=".6"'))
        leaf = LAV if mode == "dark" else VIOLET
    if not small:
        leaves = "".join(f'<g transform="translate({lx} 14) rotate({rot})">{rrect(0, 0, 8.6, 2.4, leaf)}</g>'
                         for lx, rot in ((44.2, 30), (55.8, 60)))
        out.append(f'<g class="prism-leaves">{leaves}</g>')
    return (f"<defs>{defs}</defs>" if defs else "") + "".join(out)


QUAD_TILES = [  # (cx, cy, colour)
    (27, 33, "#3D72F5"),
    (27, 79, "#7C55F7"),
    (73, 79, "#D4479C"),
]
QUAD_LIFT = (76.5, 27.5, "#F58A3D")


def mark_quad(p, mode="dark", ink=WHITE, small=False, animate=False):
    """Four soft squares, one per brand colour; the last one lifts and turns into the leaf."""
    t, r = 38, 10.5
    defs = []
    out = []
    for i, (cx, cy, col) in enumerate(QUAD_TILES):
        if mode == "mono":
            fill = ink
        else:
            gid = f"{p}q{i}"
            defs.append(lin(gid, cx - t / 2, cy - t / 2, cx + t / 2, cy + t / 2,
                            [(0, _mix(col, "#FFFFFF", 0.16)), (1, col)]))
            fill = f"url(#{gid})"
        out.append(rrect(cx, cy, t, r, fill, f' class="quad-tile quad-{i}"' if animate else ""))
    lx, ly, lcol = QUAD_LIFT
    if mode == "mono":
        fill = ink
    else:
        defs.append(lin(f"{p}ql", lx - 15, ly - 15, lx + 15, ly + 15,
                        [(0, _mix(lcol, "#FFFFFF", 0.18)), (1, lcol)]))
        fill = f"url(#{p}ql)"
    s = t * 0.8
    cls = ' class="quad-lift"' if animate else ""
    out.append(f'<g{cls} transform="translate({lx} {ly}) rotate(45)">{rrect(0, 0, s, r * 0.8, fill)}</g>')
    return (f"<defs>{''.join(defs)}</defs>" if defs else "") + "".join(out)


def _mix(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))


# ---------------------------------------------------------------------------
# Wordmark: Bricolage Grotesque outlines (the site's display face), set as paths.
# ---------------------------------------------------------------------------

def wordmark(text, wght, track, size):
    """Returns (path_d, width) for text set at `size` units, baseline at y=0."""
    gs = FONT.getGlyphSet(location={"wght": wght})
    scale = size / UPM
    x = 0.0
    parts = []
    for ch in text:
        gname = CMAP[ord(ch)]
        g = gs[gname]
        pen = SVGPathPen(gs, ntos=lambda v: f(v))
        tp = TransformPen(pen, (scale, 0, 0, -scale, x, 0))
        g.draw(tp)
        parts.append(pen.getCommands())
        x += g.width * scale + track * scale
    return "".join(parts), x - track * scale


CONCEPTS = [
    {
        "id": "drupe",
        "name": "Drupe",
        "tag": "Pixel berry",
        "fn": mark_drupe,
        "word": ("squaberry", 640, -22),
        "line": "A berry built from nineteen soft squares, the way a raspberry is built from drupelets: "
                "the name drawn literally, in pixels.",
        "notes": [
            "Squares shrink toward the edge, so the flat grid reads as a sphere.",
            "The two leaves carry over from the current mark, so the change feels like an evolution.",
            "Favicon uses an eight-square version; the full mark is for 48px and up.",
        ],
        "motion": "Squares drop in row by row and settle, like pixels loading.",
        "drop": True,
    },
    {
        "id": "trace",
        "name": "Trace",
        "tag": "Continuous line",
        "fn": mark_trace,
        "word": ("squaberry", 480, -8),
        "line": "One unbroken line leaves a square, folds into an S and lands on a round berry: "
                "square to berry in a single stroke, like a circuit trace.",
        "notes": [
            "Square pad at the start, round pad at the end: the two halves of the name.",
            "The stroke is built for drawing on: it can trace itself in on load or on hover.",
            "Lighter wordmark weight to match the line; it is the most technical of the four.",
        ],
        "motion": "The line draws itself from the square to the berry, then the berry lights up.",
    },
    {
        "id": "prism",
        "name": "Prism",
        "tag": "Dimensional square",
        "fn": mark_prism,
        "word": ("Squaberry", 700, -28),
        "line": "The square becomes a soft glass cube, its three faces carrying the gradient, with the "
                "berry's leaves on the lid: a sugar-cube berry.",
        "notes": [
            "Three faces map the gradient: blue lid, violet to pink side, pink to orange side.",
            "In one colour the gaps between faces keep it reading as a cube.",
            "Most premium and product-like; it suits app icons and 3D or motion work.",
        ],
        "motion": "The lid lifts and catches the light, then settles back on the cube.",
    },
    {
        "id": "quad",
        "name": "Quad",
        "tag": "Kinetic tiles",
        "fn": mark_quad,
        "word": ("squaberry", 600, -26),
        "line": "Four soft squares, one per brand colour; the fourth lifts out and turns into a leaf, "
                "a square caught in the moment it becomes a berry.",
        "notes": [
            "Simplest shape of the four, so it stays sharp at 16px with no special version.",
            "The turned tile gives it motion even when still, and a natural animation.",
            "Tiles echo the site's soft-square buttons and the gradient square in the nav.",
        ],
        "motion": "The orange tile starts in the grid, then lifts and turns 45° into the leaf.",
    },
]


def svg(inner, vb="0 0 100 100", w=None, h=None, title=None, cls=None, extra=""):
    attrs = [f'xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"']
    if w:
        attrs.append(f'width="{f(w)}"')
    if h:
        attrs.append(f'height="{f(h)}"')
    if cls:
        attrs.append(f'class="{cls}"')
    if title:
        attrs.append('role="img"')
        inner = f"<title>{html.escape(title)}</title>" + inner
    else:
        attrs.append('aria-hidden="true"')
    return f"<svg {' '.join(attrs)}{extra}>{inner}</svg>"


_uid = [0]


def uid(base):
    _uid[0] += 1
    return f"{base}{_uid[0]}_"


def mark(c, mode="dark", ink=WHITE, small=False, animate=False, title=None, cls=None, size=None):
    kw = {}
    if animate and c["id"] in ("trace", "quad"):
        kw["animate"] = True
    inner = c["fn"](uid(c["id"][0]), mode=mode, ink=ink, small=small, **kw)
    return svg(inner, w=size, h=size, title=title, cls=cls)


def lockup(c, mode="dark", word_ink=WHITE, mark_ink=WHITE, title=None, cls=None, height=None):
    text, wght, track = c["word"]
    size = c.get("word_size", 62)
    d, tw = wordmark(text, wght, track, size)
    gap = 22
    xh = FONT["OS/2"].sxHeight * size / UPM
    baseline = 50 + xh / 2 + 1
    m = c["fn"](uid(c["id"][0]), mode=mode, ink=mark_ink)
    W = 100 + gap + tw + 2
    inner = (f'<g>{m}</g><path transform="translate({f(100 + gap)} {f(baseline)})" d="{d}" '
             f'fill="{word_ink}"/>')
    w = h = None
    if height:
        h = height
        w = W / 100 * height
    return svg(inner, vb=f"0 0 {f(W)} 100", w=w, h=h, title=title, cls=cls), W


def write(name, content):
    (OUT / name).write_text('<?xml version="1.0" encoding="UTF-8"?>\n' + content + "\n", encoding="utf-8")


def app_icon(c, style):
    """180x180 icon tile. style 'dark' = charcoal tile + colour mark, 'grad' = gradient tile + white mark."""
    p = uid("ai")
    if style == "dark":
        bg = (f'<defs>{lin(p + "bg", 0, 0, 0, 180, [(0, "#2E2E2E"), (1, "#1C1C1C")])}</defs>'
              f'<rect width="180" height="180" rx="40" fill="url(#{p}bg)"/>')
        inner = c["fn"](uid(c["id"][0]), mode="dark")
    else:
        bg = (f'<defs>{lin(p + "bg", 0, 0, 180, 180)}</defs>'
              f'<rect width="180" height="180" rx="40" fill="url(#{p}bg)"/>')
        inner = c["fn"](uid(c["id"][0]), mode="mono", ink="#FFFFFF")
    return svg(bg + f'<g transform="translate(36 36) scale(1.08)">{inner}</g>', vb="0 0 180 180")


# ---------------------------------------------------------------------------
# Files
# ---------------------------------------------------------------------------

def build_files():
    for c in CONCEPTS:
        i = c["id"]
        t = f"Squaberry {c['name']} mark"
        write(f"{i}-mark.svg", mark(c, "dark", title=t))
        write(f"{i}-mark-light.svg", mark(c, "light", title=t))
        write(f"{i}-mark-white.svg", mark(c, "mono", WHITE, title=t))
        write(f"{i}-mark-charcoal.svg", mark(c, "mono", CHARCOAL, title=t))
        write(f"{i}-favicon.svg", mark(c, "dark", small=True, title=t))
        write(f"{i}-lockup-dark.svg", lockup(c, "dark", WHITE, title=f"Squaberry ({c['name']})")[0])
        write(f"{i}-lockup-light.svg", lockup(c, "light", CHARCOAL, title=f"Squaberry ({c['name']})")[0])
        write(f"{i}-lockup-white.svg", lockup(c, "mono", WHITE, WHITE, title=f"Squaberry ({c['name']})")[0])
        write(f"{i}-app-icon.svg", app_icon(c, "dark"))
        write(f"{i}-app-icon-gradient.svg", app_icon(c, "grad"))


# ---------------------------------------------------------------------------
# Review page
# ---------------------------------------------------------------------------

def font_face():
    b = base64.b64encode((HERE / "fonts" / "bricolage-latin.woff2").read_bytes()).decode()
    fi = base64.b64encode((HERE / "fonts" / "figtree-latin.woff2").read_bytes()).decode()
    return (f"@font-face{{font-family:'Bricolage Grotesque';font-weight:200 800;font-display:swap;"
            f"src:url(data:font/woff2;base64,{b}) format('woff2')}}"
            f"@font-face{{font-family:'Figtree';font-weight:300 900;font-display:swap;"
            f"src:url(data:font/woff2;base64,{fi}) format('woff2')}}")


ARROW = ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>')
CHEV = ('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" '
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')


def dock(c):
    lk, _ = lockup(c, "dark", WHITE, cls="dock-logo")
    return f"""
      <div class="dock" aria-label="Header preview with the {c['name']} logo">
        <span class="dock-brand">{lk}</span>
        <span class="dock-divider" aria-hidden="true"></span>
        <span class="dock-nav"><span class="dock-link">Services {CHEV}</span><span class="dock-link">Products {CHEV}</span><span class="dock-link is-current">Our Work</span><span class="dock-link">About</span></span>
        <span class="dock-mail">hello@squaberry.co.uk</span>
        <span class="dock-cta">Start a project <span class="dock-cta-icon">{ARROW}</span></span>
        <span class="dock-menu">Menu</span>
      </div>"""


def concept_section(n, c):
    i = c["id"]
    hero_mark = mark(c, "dark", animate=True, cls="hero-mark", title=f"{c['name']} mark")
    lk_dark, _ = lockup(c, "dark", WHITE, cls="lockup", title=f"Squaberry lock-up, {c['name']}")
    lk_light, _ = lockup(c, "light", CHARCOAL, cls="lockup")
    lk_white, _ = lockup(c, "mono", WHITE, WHITE, cls="lockup")
    tiles = [
        ("On charcoal", "tile-dark", mark(c, "dark")),
        ("On cream", "tile-cream", mark(c, "light")),
        ("One colour, white", "tile-dark", mark(c, "mono", WHITE)),
        ("One colour, charcoal", "tile-cream", mark(c, "mono", CHARCOAL)),
    ]
    tiles_html = "".join(
        f'<figure class="tile {cls}">{m}<figcaption>{lab}</figcaption></figure>' for lab, cls, m in tiles)
    fav_small = mark(c, "dark", small=True)
    fav_svg_src = mark(c, "dark", small=True)
    fav_data = base64.b64encode(fav_svg_src.encode()).decode()
    favs = f"""
        <div class="favs">
          <div class="fav-sizes">
            <figure><span class="fav fav16">{fav_small}</span><figcaption>16</figcaption></figure>
            <figure><span class="fav fav32">{fav_small}</span><figcaption>32</figcaption></figure>
            <figure><span class="fav fav180">{app_icon(c, 'dark')}</span><figcaption>180</figcaption></figure>
          </div>
          <div class="fav-zoom">
            <canvas class="px" data-src="data:image/svg+xml;base64,{fav_data}" data-size="16" width="96" height="96" aria-label="16px favicon enlarged six times"></canvas>
            <canvas class="px" data-src="data:image/svg+xml;base64,{fav_data}" data-size="32" width="96" height="96" aria-label="32px favicon enlarged three times"></canvas>
            <p>16px and 32px rendered to real pixels, then enlarged.</p>
          </div>
          <div class="tab-mock" aria-hidden="true">
            <span class="tab is-active"><span class="tab-fav">{fav_small}</span>Squaberry | Web, apps &amp; IT</span>
            <span class="tab"><span class="tab-dot"></span>Inbox</span>
          </div>
        </div>"""
    apps = f"""
        <div class="apps">
          <figure>{app_icon(c, 'dark')}<figcaption>Squaberry</figcaption></figure>
          <figure>{app_icon(c, 'grad')}<figcaption>Squaberry</figcaption></figure>
        </div>"""
    notes = "".join(f"<li>{html.escape(t)}</li>" for t in c["notes"])
    files = ", ".join(f"<code>{i}-{s}.svg</code>" for s in (
        "mark", "mark-light", "mark-white", "mark-charcoal", "favicon", "lockup-dark", "lockup-light",
        "lockup-white", "app-icon", "app-icon-gradient"))
    return f"""
  <section class="concept" id="{i}" aria-labelledby="{i}-h" data-concept="{i}"{' data-drop-anim' if c.get('drop') else ''}>
    <div class="concept-head">
      <p class="eyebrow"><span class="sq" aria-hidden="true"></span>{SECTION_LABEL} {chr(64 + n)} · {html.escape(c['tag'])}</p>
      <h2 id="{i}-h">{html.escape(c['name'])}</h2>
      <p class="rationale">{html.escape(c['line'])}</p>
    </div>
    <div class="stage">
      <div class="stage-mark">{hero_mark}
        <button class="replay" type="button" data-replay="{i}">Replay motion</button>
        <p class="motion-note">{html.escape(c['motion'])}</p>
      </div>
      <div class="stage-lockups">
        <div class="lk lk-dark">{lk_dark}</div>
        <div class="lk lk-cream">{lk_light}</div>
        <div class="lk lk-grad">{lk_white}</div>
      </div>
    </div>
    <div class="tiles">{tiles_html}</div>
    <h3>Favicon sizes</h3>
    {favs}
    <h3>In the header dock</h3>
    <div class="dock-wrap">{dock(c)}</div>
    <h3>App icon</h3>
    {apps}
    <div class="concept-foot">
      <ul class="notes">{notes}</ul>
      <p class="files">Files: {files}</p>
    </div>
  </section>"""


CURRENT_LOGO = (HERE.parent.parent / "public" / "assets" / "squaberry-logo.svg")


DEFAULT_COPY = {
    "title": "Squaberry Logo Concepts",
    "eyebrow": "Brand exploration · not live",
    "h1": "Four new directions for the Squaberry mark",
    "lead": "Each direction starts from the name: the soft square and the berry. All four are hand-built vectors in the site's gradient and Bricolage Grotesque, shown on charcoal and cream, in one colour, at favicon size, in the header and as an app icon.",
    "ref_label": "Current logo, for reference",
    "ref_html": None,
    "cmp_h": "The four lock-ups together",
    "rec": """<h3>Recommendation: Drupe, with Quad as the simpler fallback</h3>
      <p><strong>Drupe</strong> is the most ownable: a berry made of soft squares says "Squaberry" without any explanation, keeps the two leaves people already know, and looks digital without looking cold. Its one cost is a separate eight-square version for favicons.</p>
      <p><strong>Quad</strong> is the most robust: four tiles in the four brand colours work at 16px, animate with one move, and match the site's soft-square buttons. Pick it if you want something you can stamp on anything.</p>
      <p><strong>Trace</strong> is the strongest in motion and holds up well at 16px, but reads more as an S than as a berry. <strong>Prism</strong> is the most premium and suits 3D and app icons, but the cube gets busy at favicon size.</p>""",
    "overview": True,
    "showcase": "",
    "foot": "Exploration only. The live logo, favicon and share cards are unchanged. Wordmarks are Bricolage Grotesque converted to outlines; the final lock-up would get hand-kerned spacing.",
}


def page(fragment=False, copy=None):
    cp = {**DEFAULT_COPY, **(copy or {})}
    overview = "".join(
        f'<a class="ov" href="#{c["id"]}">{mark(c, "dark", cls="ov-mark")}<span class="ov-name">{chr(65 + k)} · {c["name"]}</span>'
        f'<span class="ov-tag">{html.escape(c["tag"])}</span></a>'
        for k, c in enumerate(CONCEPTS))
    sections = "".join(concept_section(k + 1, c) for k, c in enumerate(CONCEPTS))
    overview_html = f'<nav class="overview" aria-label="Concepts">{overview}</nav>' if cp["overview"] else ""
    if cp["ref_html"]:
        current = cp["ref_html"]
    else:
        current = CURRENT_LOGO.read_text(encoding="utf-8")
        current = current[current.index("<svg"):]
        current = current.replace("<svg ", '<svg class="current-logo" ', 1)
    lockups_compare = "".join(
        f'<div class="cmp-row"><span class="cmp-label">{c["name"]}</span>{lockup(c, "dark", WHITE, cls="cmp-lockup")[0]}</div>'
        for c in CONCEPTS)
    head = f"""<title>{cp["title"]}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
{font_face()}
/* Layout: a single dark column of concept boards, one per direction, each running mark → lock-ups → sizes → context. */
:root{{
  --bg:#1C1C1C;--surface:#252525;--surface-2:#2E2E2E;--line:rgba(255,255,255,.1);
  --fg:#FFFFFD;--fg-2:#D3D3CD;--fg-3:#A3A39D;--lav:#B3A8FF;--spark:#C49BFF;--cream:#F9F8F3;--ink:#1C1C1C;
  --grad:linear-gradient(100deg,#3D72F5 0%,#7C55F7 36%,#D4479C 72%,#F58A3D 100%);
  --display:'Bricolage Grotesque',system-ui,sans-serif;--body:'Figtree',system-ui,sans-serif;
  --r:24px;--r-sm:14px;color-scheme:dark;
}}
*,*::before,*::after{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--fg);font-family:var(--body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}}
svg{{display:block}}
h1,h2,h3{{font-family:var(--display);font-weight:600;letter-spacing:-.03em;line-height:1.05;margin:0;text-wrap:balance}}
p{{margin:0;text-wrap:pretty}}
a{{color:inherit}}
:focus-visible{{outline:2px solid var(--spark);outline-offset:3px;border-radius:6px}}
.wrap{{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:56px 96px;display:grid;gap:72px}}
@media (min-width:700px){{.wrap{{padding-left:max(40px,env(safe-area-inset-left,0px));padding-right:max(40px,env(safe-area-inset-right,0px))}}}}
.eyebrow{{display:flex;align-items:center;gap:10px;color:var(--fg-3);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}}
.sq{{width:9px;height:9px;border-radius:2.5px;background:var(--grad)}}
.intro{{display:grid;gap:28px}}
.intro h1{{font-size:clamp(40px,7vw,84px)}}
.intro-grid{{display:grid;gap:24px;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:end}}
.intro-grid > *{{min-width:0}}
.lead{{color:var(--fg-2);font-size:18px;max-width:60ch}}
.current{{display:grid;gap:10px;padding:20px 22px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}}
.current p{{color:var(--fg-3);font-size:14px}}
.current-logo{{width:150px;height:auto;filter:brightness(0) invert(1);opacity:.85}}
.overview{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}}
.ov{{display:grid;gap:6px;justify-items:start;padding:22px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);text-decoration:none;transition:border-color .25s,transform .35s cubic-bezier(.22,1,.36,1)}}
.ov:hover{{border-color:rgba(255,255,255,.22);transform:translateY(-3px)}}
.ov-mark{{width:min(110px,100%);height:auto;aspect-ratio:1;margin-bottom:12px}}
.ov-name{{font-family:var(--display);font-size:22px;font-weight:600;letter-spacing:-.02em}}
.ov-tag{{color:var(--fg-3);font-size:14px}}
.concept{{display:grid;gap:22px;padding-top:56px;border-top:1px solid var(--line);scroll-margin-top:20px}}
.concept-head{{display:grid;gap:14px;max-width:820px}}
.concept-head h2{{font-size:clamp(40px,6vw,68px)}}
.rationale{{color:var(--fg-2);font-size:clamp(17px,1.6vw,20px)}}
.concept h3{{margin-top:18px;color:var(--fg-3);font-family:var(--body);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}}
.stage{{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}}
.stage-mark{{position:relative;display:grid;place-items:center;min-height:380px;padding:48px 24px 70px;border-radius:var(--r);background:radial-gradient(120% 90% at 50% 30%,#2A2A2A 0%,#1A1A1A 70%);border:1px solid var(--line);overflow:hidden}}
.hero-mark{{width:min(230px,70%);height:auto;aspect-ratio:1}}
.replay{{position:absolute;left:18px;bottom:18px;min-height:40px;padding:0 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.06);color:var(--fg);font:600 14px var(--body);cursor:pointer}}
.replay:hover{{background:rgba(255,255,255,.12)}}
.motion-note{{position:absolute;right:18px;bottom:22px;left:170px;color:var(--fg-3);font-size:13px;text-align:right}}
.stage-lockups{{display:grid;gap:14px;grid-template-rows:repeat(3,1fr)}}
.lk{{display:grid;place-items:center;padding:28px 24px;border-radius:var(--r);min-height:110px}}
.lk-dark{{background:var(--surface);border:1px solid var(--line)}}
.lk-cream{{background:var(--cream)}}
.lk-grad{{background:var(--grad)}}
.lockup{{width:min(340px,100%);height:auto}}
.tiles{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}}
.tile{{display:grid;gap:14px;justify-items:center;margin:0;padding:30px 16px 16px;border-radius:var(--r)}}
.tile svg{{width:min(120px,80%);height:auto;aspect-ratio:1}}
.tile figcaption{{font-size:13px;font-weight:500}}
.tile-dark{{background:var(--surface);border:1px solid var(--line);color:var(--fg-3)}}
.tile-cream{{background:var(--cream);color:#5B5B55}}
.favs{{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:14px;align-items:stretch}}
.favs > div{{padding:20px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}}
.fav-sizes{{display:flex;align-items:flex-end;gap:22px}}
.fav-sizes figure{{display:grid;gap:8px;justify-items:center;margin:0}}
.fav-sizes figcaption,.fav-zoom p{{color:var(--fg-3);font-size:12px}}
.fav svg{{width:100%;height:100%}}
.fav16{{width:16px;height:16px}}.fav32{{width:32px;height:32px}}.fav180{{width:180px;height:180px}}
.fav-zoom{{display:grid;grid-template-columns:96px 96px;gap:12px;align-content:center}}
.fav-zoom p{{grid-column:1/-1;max-width:24ch}}
.px{{width:96px;height:96px;border-radius:10px;background:#141414;image-rendering:pixelated}}
.tab-mock{{display:flex;align-items:flex-end;gap:4px;align-self:start;padding:12px 12px 0 !important;background:#141414 !important;overflow:hidden}}
.tab{{display:flex;align-items:center;gap:8px;min-width:0;padding:9px 14px;border-radius:10px 10px 0 0;color:var(--fg-3);font-size:13px;white-space:nowrap}}
.tab.is-active{{background:#2B2B2B;color:var(--fg)}}
.tab-fav{{flex:none;width:16px;height:16px}}.tab-fav svg{{width:16px;height:16px}}
.tab-dot{{width:14px;height:14px;border-radius:4px;background:#3A3A3A}}
.dock-wrap{{padding:28px clamp(12px,3vw,32px);border-radius:var(--r);background:linear-gradient(180deg,#232323,#1A1A1A);border:1px solid var(--line);overflow:hidden}}
.dock{{display:flex;align-items:center;gap:4px;height:66px;padding:0 9px 0 18px;border:1px solid rgba(255,255,255,.08);border-radius:20px;background:rgba(36,36,36,.8);box-shadow:0 18px 50px -20px rgba(0,0,0,.7)}}
.dock-brand{{flex:none}}
.dock-logo{{height:30px;width:auto}}
.dock-divider{{flex:none;width:1px;height:26px;margin:0 12px 0 18px;background:rgba(255,255,255,.14)}}
.dock-nav{{display:flex;gap:2px;margin-right:auto;min-width:0}}
.dock-link{{display:inline-flex;align-items:center;gap:7px;padding:10px 13px;border-radius:12px;color:var(--fg-2);font-size:15px;font-weight:500;white-space:nowrap}}
.dock-link svg{{color:var(--fg-3)}}
.dock-link.is-current{{color:var(--fg)}}
.dock-link.is-current::before{{content:'';width:7px;height:7px;border-radius:2px;background:var(--grad)}}
.dock-mail{{padding:0 14px;color:var(--fg-3);font-size:14px;white-space:nowrap}}
.dock-cta{{display:inline-flex;align-items:center;gap:12px;min-height:48px;padding:0 6px 0 18px;border-radius:14px;background:var(--grad);color:#fff;font-size:15px;font-weight:600;white-space:nowrap}}
.dock-cta-icon{{display:grid;place-items:center;width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,.18)}}
.dock-menu{{display:none;margin-left:auto;padding:11px 16px;border-radius:12px;background:rgba(255,255,255,.08);font-size:15px;font-weight:600}}
.apps{{display:flex;flex-wrap:wrap;gap:28px;padding:36px clamp(20px,4vw,48px);border-radius:var(--r);background:radial-gradient(140% 120% at 20% 0%,#3B2F6B 0%,#24203A 45%,#151515 100%);border:1px solid var(--line)}}
.apps figure{{display:grid;gap:10px;justify-items:center;margin:0}}
.apps svg{{width:120px;height:120px;filter:drop-shadow(0 14px 24px rgba(0,0,0,.45))}}
.apps figcaption{{font-size:13px;font-weight:500;color:var(--fg)}}
.concept-foot{{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:24px;margin-top:10px}}
.notes{{display:grid;gap:8px;margin:0;padding:0;list-style:none;color:var(--fg-2)}}
.notes li{{position:relative;padding-left:20px}}
.notes li::before{{content:'';position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:2px;background:var(--lav)}}
.files{{color:var(--fg-3);font-size:13px;overflow-wrap:anywhere}}
.files code{{font-size:12px;color:var(--fg-2)}}
.compare{{display:grid;gap:14px;padding-top:56px;border-top:1px solid var(--line)}}
.compare h2{{font-size:clamp(34px,5vw,56px)}}
.cmp{{display:grid;gap:10px;padding:26px;border-radius:var(--r);background:var(--surface);border:1px solid var(--line)}}
.cmp-row{{display:grid;grid-template-columns:90px minmax(0,1fr);align-items:center;gap:18px;padding:12px 0}}
.cmp-row + .cmp-row{{border-top:1px solid var(--line)}}
.cmp-label{{color:var(--fg-3);font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}}
.cmp-lockup{{height:46px;width:auto;max-width:100%}}
.showcase{{display:grid;gap:14px}}
.showcase .lk{{padding:clamp(40px,7vw,96px) clamp(20px,5vw,64px)}}
.showcase .lockup{{width:min(760px,100%)}}
.showcase-pair{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}
.showcase-pair .lockup{{width:min(380px,100%)}}
@media (max-width:760px){{.showcase-pair{{grid-template-columns:minmax(0,1fr)}}}}
.rec{{display:grid;gap:12px;padding:28px;border-radius:var(--r);background:var(--cream);color:var(--ink)}}
.rec h3{{color:var(--ink);font-family:var(--display);font-size:28px;letter-spacing:-.02em;text-transform:none}}
.rec p{{max-width:70ch;color:#3A3A36}}
.foot{{color:var(--fg-3);font-size:13px}}

/* Motion (all off under reduced motion) */
.trace-line{{stroke-dasharray:100;stroke-dashoffset:0}}
.is-playing .trace-line{{animation:trace-draw 1.6s cubic-bezier(.65,0,.35,1) both}}
.is-playing .trace-start{{animation:pop .5s cubic-bezier(.22,1,.36,1) both}}
.is-playing .trace-end{{transform-box:fill-box;transform-origin:center;animation:pop .6s cubic-bezier(.34,1.56,.64,1) 1.45s both}}
@keyframes trace-draw{{from{{stroke-dashoffset:100}}to{{stroke-dashoffset:0}}}}
@keyframes pop{{from{{opacity:0;transform:scale(.3)}}to{{opacity:1;transform:none}}}}
.quad-lift{{transition:none}}
.is-playing .quad-lift{{animation:quad-lift 1.3s cubic-bezier(.34,1.3,.64,1) .25s both}}
@keyframes quad-lift{{from{{transform:translate(73px,33px) rotate(0deg) scale(1.25)}}to{{transform:translate(76.5px,27.5px) rotate(45deg) scale(1)}}}}
.is-playing .quad-tile{{transform-box:fill-box;transform-origin:center;animation:pop .55s cubic-bezier(.22,1,.36,1) both}}
.is-playing .quad-1{{animation-delay:.08s}}.is-playing .quad-2{{animation-delay:.16s}}
.is-playing [data-drop]{{animation:drop .6s cubic-bezier(.22,1,.36,1) both}}
@keyframes drop{{from{{opacity:0;transform:translateY(-14px)}}to{{opacity:1;transform:none}}}}
.is-playing [data-lid]{{animation:lid 1.6s cubic-bezier(.22,1,.36,1) both}}
@keyframes lid{{0%{{transform:none}}35%{{transform:translateY(-9px)}}100%{{transform:none}}}}
.is-playing [data-sheen]{{animation:sheen 1.6s ease both}}
@keyframes sheen{{0%,100%{{opacity:.6}}35%{{opacity:1}}}}
@media (prefers-reduced-motion:reduce){{
  .is-playing *{{animation:none !important}}
  .replay{{display:none}}
  .ov{{transition:none}}
}}

@media (max-width:1100px){{
  .dock-mail{{display:none}}
}}
@media (max-width:960px){{
  .stage,.intro-grid,.concept-foot{{grid-template-columns:minmax(0,1fr)}}
  .overview,.tiles{{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .favs{{grid-template-columns:minmax(0,1fr)}}
  .dock-nav,.dock-divider,.dock-cta{{display:none}}
  .dock-menu{{display:block}}
}}
@media (max-width:520px){{
  .fav-sizes{{flex-wrap:wrap}}
  .fav180{{width:120px;height:120px}}
  .stage-mark{{min-height:300px}}
  .motion-note{{position:static;margin-top:16px;text-align:center}}
  .stage-mark{{padding-bottom:76px}}
  .apps svg{{width:96px;height:96px}}
  .cmp-row{{grid-template-columns:minmax(0,1fr);gap:8px}}
  .cmp-lockup{{height:36px}}
}}
</style>"""
    body = f"""
<main class="wrap">
  <header class="intro">
    <p class="eyebrow"><span class="sq" aria-hidden="true"></span>{cp["eyebrow"]}</p>
    <div class="intro-grid">
      <div style="display:grid;gap:20px;min-width:0">
        <h1>{cp["h1"]}</h1>
        <p class="lead">{cp["lead"]}</p>
      </div>
      <div class="current">
        <p>{cp["ref_label"]}</p>
        {current}
      </div>
    </div>
    {overview_html}
  </header>
{cp["showcase"]}{sections}
  <section class="compare" aria-labelledby="cmp-h">
    <p class="eyebrow"><span class="sq" aria-hidden="true"></span>Side by side</p>
    <h2 id="cmp-h">{cp["cmp_h"]}</h2>
    <div class="cmp">{lockups_compare}</div>
    <div class="rec">
      {cp["rec"]}
    </div>
  </section>
  <p class="foot">{cp["foot"]}</p>
</main>
<script>
(function(){{
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Tag drupe squares and prism faces so the CSS can animate them.
  document.querySelectorAll('[data-drop-anim] .hero-mark').forEach(function(s){{
    var rs = s.querySelectorAll('rect, path.leaf'), step = rs.length > 12 ? 0.035 : 0.09;
    rs.forEach(function(r, i){{ r.setAttribute('data-drop', ''); r.style.animationDelay = (i * step) + 's'; }});
  }});
  document.querySelectorAll('[data-concept="prism"] .hero-mark').forEach(function(s){{
    var paths = s.querySelectorAll('path');
    if (paths[0]) paths[0].setAttribute('data-lid', '');
    if (paths[3]) {{ paths[3].setAttribute('data-lid', ''); paths[3].setAttribute('data-sheen', ''); }}
    s.querySelectorAll('.prism-leaves').forEach(function(g){{ g.setAttribute('data-lid', ''); }});
  }});
  function play(id){{
    var el = document.querySelector('[data-concept="' + id + '"] .stage-mark');
    if (!el || reduce) return;
    el.classList.remove('is-playing'); void el.offsetWidth; el.classList.add('is-playing');
  }}
  document.querySelectorAll('[data-replay]').forEach(function(b){{
    b.addEventListener('click', function(){{ play(b.getAttribute('data-replay')); }});
  }});
  // Play each concept's motion once when it scrolls into view (content is visible at rest either way).
  // Start watching only after the first scroll, so the page (and any thumbnail) loads with every mark at rest.
  function watch(){{
  window.removeEventListener('scroll', watch);
  if ('IntersectionObserver' in window && !reduce) {{
    var io = new IntersectionObserver(function(entries){{
      entries.forEach(function(e){{
        if (e.isIntersecting) {{ play(e.target.getAttribute('data-concept')); io.unobserve(e.target); }}
      }});
    }}, {{threshold: .35}});
    document.querySelectorAll('.concept').forEach(function(s){{ io.observe(s); }});
  }}
  }}
  window.addEventListener('scroll', watch, {{passive: true}});
  // Render favicons at true pixel size, then enlarge without smoothing.
  document.querySelectorAll('canvas.px').forEach(function(cv){{
    var size = +cv.getAttribute('data-size');
    var img = new Image();
    img.onload = function(){{
      var small = document.createElement('canvas'); small.width = small.height = size;
      var sctx = small.getContext('2d'); sctx.fillStyle = '#2B2B2B'; sctx.fillRect(0, 0, size, size);
      sctx.drawImage(img, 0, 0, size, size);
      var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, cv.width, cv.height);
    }};
    img.src = cv.getAttribute('data-src');
  }});
}})();
</script>"""
    if fragment:
        return head + body
    return ("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
            + head + "\n</head>\n<body>" + body + "\n</body>\n</html>\n")


if __name__ == "__main__":
    build_files()
    (HERE / "index.html").write_text(page(), encoding="utf-8")
    out = os.environ.get("ARTIFACT_OUT")
    if out:
        Path(out).write_text(page(fragment=True), encoding="utf-8")
    print("built", len(list(HERE.glob("*.svg"))), "svg files + index.html")
