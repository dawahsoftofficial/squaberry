"""Colour treatments for the Pop mark: gradient vs flat options, side by side.
Writes SVGs and a review page to design/logo-concepts/pop-colour/.

Run from the repo root:  python design/logo-concepts/build_colour.py
ARTIFACT_OUT=<path> also writes the Artifact fragment.
"""
import html
import os
from pathlib import Path

import build as B
import build_drupe as D
from build import CHARCOAL, CREAM, LAV, VIOLET, WHITE, lin, rrect, f

GRAD = "grad"
# Square order: top-left, top-middle, middle-left, middle-right, bottom. Then the leaf.
TREATMENTS = [
    {
        "id": "gradient", "name": "Gradient", "tag": "What you have now",
        "dark": ([GRAD] * 5, LAV), "light": ([GRAD] * 5, VIOLET),
        "line": "One gradient runs across all five squares. Rich on screen, but it needs a gradient-capable "
                "medium and blends into the site's gradient buttons.",
    },
    {
        "id": "stepped", "name": "Stepped", "tag": "The gradient, in flat steps",
        "dark": (["#3D72F5", "#5C64F6", "#7C55F7", "#A84EC9", "#D4479C"], "#F58A3D"),
        "light": (["#3D72F5", "#5C64F6", "#7C55F7", "#A84EC9", "#D4479C"], "#F58A3D"),
        "line": "Each square is one flat colour from the brand gradient, blue to pink, and the leaf is the orange "
                "end. Keeps every brand colour but reads as crisp, pixel-like tiles.",
    },
    {
        "id": "accent", "name": "Ink + leaf", "tag": "Neutral berry, one colour accent",
        "dark": ([WHITE] * 5, "#8F6BFF"), "light": ([CHARCOAL] * 5, "#7C55F7"),
        "line": "White squares on dark, charcoal on light, with only the leaf in violet. The most restrained and "
                "the most modern; the colour moment is tiny and deliberate.",
    },
    {
        "id": "solid", "name": "Solid violet", "tag": "One brand colour",
        "dark": (["#7C55F7"] * 5, LAV), "light": (["#7C55F7"] * 5, VIOLET),
        "line": "All squares in the brand violet, leaf in lavender. One colour to own, simple to print, "
                "embroider or put on a sticker.",
    },
    {
        "id": "tonal", "name": "Tonal violet", "tag": "Shades of one colour",
        "dark": (["#C9C0FF", "#B3A8FF", "#9C8CFB", "#8B73F9", "#7C55F7"], "#E6E1FF"),
        "light": (["#9C8CFB", "#8B73F9", "#7C55F7", "#6A5BB5", "#4E3F96"], "#B3A8FF"),
        "line": "Lavender to violet, square by square. Depth without a gradient, and calmer than Stepped.",
    },
    {
        "id": "raspberry", "name": "Raspberry", "tag": "Literal berry colour",
        "dark": (["#D4479C"] * 5, "#F58A3D"), "light": (["#C43C8D"] * 5, "#E8772A"),
        "line": "Berry pink squares with an orange leaf. The warmest and most fruit-like, but it moves the brand "
                "away from violet.",
    },
]


def make_fn(t):
    def fn(p, mode="dark", ink=WHITE, small=False):
        sq = D.rows([3, 2, 1], 24 if small else 20, 28 if small else 25, 38 if small else 35)
        tr = sq.pop(2)
        leaf = (tr[0] + 2, tr[1] - 20, 21) if small else (tr[0] + 1, tr[1] - 17, 17)
        if mode == "mono":
            fills, leaf_fill = [ink] * 5, ink
        else:
            fills, leaf_fill = t["light" if mode == "light" else "dark"]
        defs = ""
        if GRAD in fills:
            defs = f"<defs>{lin(f'{p}g', 16, 14, 84, 96)}</defs>"
        out = [rrect(cx, cy, s, s * D.R, f"url(#{p}g)" if c == GRAD else c) for (cx, cy, s), c in zip(sq, fills)]
        out.append(f'<g transform="translate({f(leaf[0])} {f(leaf[1])})">{D.leaf_path(leaf[2], leaf_fill)}</g>')
        return defs + "".join(out)
    return fn


def concept(t):
    return {"id": f"pop-{t['id']}", "name": t["name"], "fn": make_fn(t), "word": D.WORD, "word_size": D.WORD_SIZE}


def favicon_canvas(c, size):
    import base64
    src = base64.b64encode(B.mark(c, "dark", small=True).encode()).decode()
    return (f'<canvas class="px" data-src="data:image/svg+xml;base64,{src}" data-size="{size}" width="64" height="64" '
            f'aria-label="{size}px favicon enlarged"></canvas>')


def card(n, t):
    c = concept(t)
    lk_dark = B.lockup(c, "dark", WHITE, cls="lockup", title=f"Squaberry logo, {t['name']}")[0]
    lk_light = B.lockup(c, "light", CHARCOAL, cls="lockup")[0]
    return f"""
  <section class="tr" id="{t['id']}" aria-labelledby="{t['id']}-h">
    <div class="tr-head">
      <p class="eyebrow"><span class="sq" aria-hidden="true"></span>{chr(64 + n)} · {html.escape(t['tag'])}</p>
      <h2 id="{t['id']}-h">{html.escape(t['name'])}</h2>
      <p class="tr-line">{html.escape(t['line'])}</p>
    </div>
    <div class="tr-grid">
      <div class="lk lk-dark tr-wide">{lk_dark}</div>
      <div class="lk lk-cream tr-wide">{lk_light}</div>
      <div class="tr-small">
        <figure class="tr-fig">{B.app_icon(c, 'dark')}<figcaption>App icon</figcaption></figure>
        <figure class="tr-fig tr-fav">{favicon_canvas(c, 32)}{favicon_canvas(c, 16)}<figcaption>32 and 16px</figcaption></figure>
      </div>
    </div>
    <div class="dock-wrap">{B.dock(c)}</div>
  </section>"""


def page(fragment=False):
    head_src = B.page(fragment=True, copy={"overview": False})
    head = head_src[:head_src.index("</style>")]
    head = head.replace("<title>Squaberry Logo Concepts</title>", "<title>Squaberry Logo Colour</title>")
    head += """
.trs{display:grid;gap:64px}
.tr{display:grid;gap:18px;padding-top:48px;border-top:1px solid var(--line)}
.tr-head{display:grid;gap:12px;max-width:760px}
.tr-head h2{font-size:clamp(34px,5vw,54px)}
.tr-line{color:var(--fg-2);font-size:17px}
.tr-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:14px}
.tr-grid .lk{min-height:150px;padding:36px 28px}
.tr-grid .lockup{width:min(330px,100%)}
.tr-small{display:flex;gap:14px}
.tr-fig{display:grid;gap:10px;justify-items:center;align-content:center;margin:0;padding:18px;border-radius:var(--r);background:var(--surface);border:1px solid var(--line);color:var(--fg-3);font-size:13px}
.tr-fig > svg{width:84px;height:84px}
.tr-fav{grid-template-columns:auto auto;column-gap:10px}
.tr-fav figcaption{grid-column:1/-1}
.tr-fav canvas{width:56px;height:56px;border-radius:10px;image-rendering:pixelated}
.palette{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
.pal{display:grid;gap:10px;justify-items:center;padding:20px 12px 16px;border-radius:var(--r);background:var(--surface);border:1px solid var(--line);text-decoration:none;color:var(--fg-2);font-size:14px;font-weight:600}
.pal svg{width:72px;height:72px}
.pal:hover{border-color:rgba(255,255,255,.24)}
@media (max-width:1100px){.tr-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.tr-small{grid-column:1/-1;justify-content:center}.palette{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){.tr-grid{grid-template-columns:minmax(0,1fr)}}
</style>"""
    palette = "".join(
        f'<a class="pal" href="#{t["id"]}">{B.mark(concept(t), "dark")}<span>{chr(65 + k)} · {html.escape(t["name"])}</span></a>'
        for k, t in enumerate(TREATMENTS))
    cards = "".join(card(k + 1, t) for k, t in enumerate(TREATMENTS))
    body = f"""
<main class="wrap">
  <header class="intro">
    <p class="eyebrow"><span class="sq" aria-hidden="true"></span>Brand exploration · Pop · colour · not live</p>
    <h1>Does Pop need the gradient?</h1>
    <p class="lead">No. Six colour treatments of the same mark, from today's gradient to fully flat. Each is shown with the wordmark on charcoal and cream, as an app icon, at real favicon pixels and in the header next to the gradient "Start a project" button.</p>
    <nav class="palette" aria-label="Colour treatments">{palette}</nav>
  </header>
  <div class="trs">{cards}</div>
  <section class="rec" aria-labelledby="rec-h">
    <h3 id="rec-h">Recommendation: Stepped, or Ink + leaf for the most modern look</h3>
    <p><strong>Stepped</strong> keeps every brand colour but drops the blend: each square is one flat colour. It looks like pixels, which suits a berry made of squares, stays sharp at 16px, prints in exact colours, and stops the logo competing with the gradient buttons.</p>
    <p><strong>Ink + leaf</strong> is the most modern and confident: a white (or charcoal) berry with one violet leaf. The site's gradient then does the colour work, and the logo stays calm everywhere. It is also the easiest to apply on photos, merch and partner pages.</p>
    <p><strong>Solid violet</strong> and <strong>Tonal violet</strong> are safe single-colour options. <strong>Raspberry</strong> is the most fruity but moves the brand away from violet. You could also combine them: Stepped as the main logo and Ink + leaf for one-colour use.</p>
  </section>
  <p class="foot">Exploration only. The live logo is unchanged. Files for each treatment are in design/logo-concepts/pop-colour/.</p>
</main>
<script>
(function(){{
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


def main():
    out_dir = B.HERE / "pop-colour"
    out_dir.mkdir(exist_ok=True)
    B.OUT = out_dir
    for t in TREATMENTS:
        c = concept(t)
        i = t["id"]
        B.write(f"pop-{i}-mark-dark.svg", B.mark(c, "dark", title=f"Squaberry mark, {t['name']}"))
        B.write(f"pop-{i}-mark-light.svg", B.mark(c, "light", title=f"Squaberry mark, {t['name']}"))
        B.write(f"pop-{i}-favicon.svg", B.mark(c, "dark", small=True, title=f"Squaberry mark, {t['name']}"))
        B.write(f"pop-{i}-lockup-dark.svg", B.lockup(c, "dark", WHITE, title=f"Squaberry ({t['name']})")[0])
        B.write(f"pop-{i}-lockup-light.svg", B.lockup(c, "light", CHARCOAL, title=f"Squaberry ({t['name']})")[0])
        B.write(f"pop-{i}-app-icon.svg", B.app_icon(c, "dark"))
    (out_dir / "index.html").write_text(page(), encoding="utf-8")
    art = os.environ.get("ARTIFACT_OUT")
    if art:
        Path(art).write_text(page(fragment=True), encoding="utf-8")
    print("built", len(list(out_dir.glob("*.svg"))), "svg files + pop-colour/index.html")


if __name__ == "__main__":
    main()
