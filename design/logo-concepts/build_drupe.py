"""Simpler Drupe variants: fewer, larger soft squares. Writes SVGs and a review page to design/logo-concepts/drupe/.

Run from the repo root:  python design/logo-concepts/build_drupe.py
Reuses the helpers and page layout from build.py. ARTIFACT_OUT=<path> also writes the Artifact fragment.
"""
import os
from pathlib import Path

import build as B
from build import LAV, VIOLET, lin, rrect, f

R = 0.3  # corner radius as a share of the square size, same as the original Drupe


def berry(p, mode, ink, squares, leaf):
    """squares: [(cx, cy, size)], leaf: (cx, cy, size, rotation)."""
    if mode != "mono":
        defs = f"<defs>{lin(f'{p}g', 16, 14, 84, 96)}</defs>"
        fill = f"url(#{p}g)"
        leaf_fill = LAV if mode == "dark" else VIOLET
    else:
        defs, fill, leaf_fill = "", ink, ink
    out = [rrect(cx, cy, s, s * R, fill) for cx, cy, s in squares]
    lx, ly, ls, rot = leaf
    shape = rrect(0, 0, ls, ls * R, leaf_fill) if rot == 45 else leaf_path(ls, leaf_fill)
    out.append(f'<g transform="translate({f(lx)} {f(ly)}) rotate({rot})">{shape}</g>')
    return defs + "".join(out)


def leaf_path(s, fill):
    """A square with two opposite corners fully rounded: the soft square turned into a leaf, tip up-right."""
    h, rb, rs = s / 2, s / 2 * 0.95, s * 0.12
    d = (f"M{f(-h + rb)} {f(-h)}L{f(h - rs)} {f(-h)}A{f(rs)} {f(rs)} 0 0 1 {f(h)} {f(-h + rs)}"
         f"L{f(h)} {f(h - rb)}A{f(rb)} {f(rb)} 0 0 1 {f(h - rb)} {f(h)}"
         f"L{f(-h + rs)} {f(h)}A{f(rs)} {f(rs)} 0 0 1 {f(-h)} {f(h - rs)}"
         f"L{f(-h)} {f(-h + rb)}A{f(rb)} {f(rb)} 0 0 1 {f(-h + rb)} {f(-h)}Z")
    return f'<path class="leaf" d="{d}" fill="{fill}"/>'


def rows(spec, size, pitch, y0, cx=50):
    sq = []
    for r, n in enumerate(spec):
        for i in range(n):
            sq.append((cx + (i - (n - 1) / 2) * pitch, y0 + r * pitch, size))
    return sq


def mark_six(p, mode="dark", ink=B.WHITE, small=False):
    """Six squares in an inverted pyramid (3-2-1): the berry's taper, nothing more."""
    if small:
        return berry(p, mode, ink, rows([3, 2, 1], 24, 28, 38), (55, 12, 16, 0))
    return berry(p, mode, ink, rows([3, 2, 1], 20, 25, 35), (55, 14, 15, 0))


def mark_seven(p, mode="dark", ink=B.WHITE, small=False):
    """Seven squares in a round cluster (2-3-2), closest to a raspberry's outline."""
    if small:
        return berry(p, mode, ink, rows([2, 3, 2], 24, 28, 36), (55, 11, 16, 0))
    return berry(p, mode, ink, rows([2, 3, 2], 19, 24, 38), (55, 16.5, 15, 0))


def mark_three(p, mode="dark", ink=B.WHITE, small=False):
    """Three big squares and a leaf: the fewest parts that still read as a berry."""
    return berry(p, mode, ink, rows([2, 1], 31, 37, 45), (56, 14, 19, 0))


def mark_pop(p, mode="dark", ink=B.WHITE, small=False):
    """The 3-2-1 berry with its top-right square popped out and turned into the leaf."""
    sq = rows([3, 2, 1], 24 if small else 20, 28 if small else 25, 38 if small else 35)
    top_right = sq.pop(2)
    lx, ly = top_right[0] + (2 if small else 1), top_right[1] - (21 if small else 18)
    return berry(p, mode, ink, sq, (lx, ly, top_right[2] * 0.8, 45))


def mark_pop_leaf(p, mode="dark", ink=B.WHITE, small=False):
    """Pop with Three's leaf: the popped square becomes a proper leaf (two corners fully rounded), tip up-right."""
    sq = rows([3, 2, 1], 24 if small else 20, 28 if small else 25, 38 if small else 35)
    top_right = sq.pop(2)
    if small:
        return berry(p, mode, ink, sq, (top_right[0] + 2, top_right[1] - 20, 21, 0))
    return berry(p, mode, ink, sq, (top_right[0] + 1, top_right[1] - 17, 17, 0))


WORD = ("squaberry", 640, -22)
WORD_SIZE = 54  # a little smaller than the first round, so the lighter marks hold their own

VARIANTS = [
    {
        "id": "drupe-six", "name": "Six", "tag": "Inverted pyramid", "fn": mark_six, "word": WORD, "word_size": WORD_SIZE, "drop": True,
        "line": "Six soft squares stacked 3-2-1 with one leaf on top: the berry's taper drawn with as few parts as "
                "possible. Same size squares, same gaps, no shading.",
        "notes": [
            "Down from 19 squares and 2 leaves to 6 squares and 1 leaf.",
            "Equal squares and gaps, so it sits on the same grid as the site's buttons.",
            "Reads at 16px with a slightly chunkier favicon cut (wider squares, tighter gaps).",
        ],
        "motion": "Squares drop in row by row, then the leaf lands.",
    },
    {
        "id": "drupe-seven", "name": "Seven", "tag": "Round cluster", "fn": mark_seven, "word": WORD, "word_size": WORD_SIZE, "drop": True,
        "line": "Seven squares in a 2-3-2 cluster: rounder and closer to a real raspberry, still a single clean "
                "geometric shape.",
        "notes": [
            "The hexagonal cluster keeps the original's round, fruity outline.",
            "One more square than Six, so it is a touch busier at 16px.",
            "Works well as an app icon because it fills a square tile evenly.",
        ],
        "motion": "Squares drop in row by row, then the leaf lands.",
    },
    {
        "id": "drupe-three", "name": "Three", "tag": "Bold trio", "fn": mark_three, "word": WORD, "word_size": WORD_SIZE, "drop": True,
        "line": "Three big squares and a leaf: the most reduced version, closer to a symbol than an illustration.",
        "notes": [
            "Fewest parts, so it is the sharpest at 16px with no separate favicon version.",
            "Big shapes carry the gradient well on merch, signage and social avatars.",
            "Reads as a berry mainly because of the leaf; on its own it is an abstract mark.",
        ],
        "motion": "The two top squares drop, then the bottom one, then the leaf.",
    },
    {
        "id": "drupe-pop", "name": "Pop", "tag": "Popped leaf", "fn": mark_pop, "word": WORD, "word_size": WORD_SIZE, "drop": True,
        "line": "The 3-2-1 berry with one square popped out and turned 45° into the leaf: a square becoming a "
                "berry, with a bit of movement even when still.",
        "notes": [
            "Same five-plus-one parts as Six, but the leaf is clearly one of the squares.",
            "The off-centre leaf gives it energy and a natural animation (the square lifts and turns).",
            "Slightly less symmetric, so it needs a little more space around it in lock-ups.",
        ],
        "motion": "Squares drop in row by row, then the last one lifts out as the leaf.",
    },
]

COPY = {
    "title": "Squaberry Drupe Variants",
    "eyebrow": "Brand exploration · Drupe refinement · not live",
    "h1": "Drupe, simplified",
    "lead": "The berry-of-squares idea with far fewer parts: equal squares, equal gaps, one flat gradient and a "
            "single leaf. Each version is shown on charcoal and cream, in one colour, at favicon size, in the "
            "header and as an app icon.",
    "ref_label": "The first Drupe (19 squares), for reference",
    "cmp_h": "The four lock-ups together",
    "rec": """<h3>Recommendation: Six</h3>
      <p><strong>Six</strong> keeps everything that made Drupe work (a berry made of soft squares, a leaf on top) with a third of the parts. It is calm, symmetric and holds up at 16px.</p>
      <p><strong>Pop</strong> is the same shape with more personality: pick it if you want the logo to feel more playful and to animate on the site.</p>
      <p><strong>Three</strong> is the most minimal and the strongest at tiny sizes, but leans on the leaf to read as a berry. <strong>Seven</strong> is the most fruit-like but brings back some of the density you wanted to lose.</p>""",
    "foot": "Exploration only. The live logo, favicon and share cards are unchanged. Wordmarks are Bricolage "
            "Grotesque converted to outlines; the final lock-up would get hand-kerned spacing.",
}


def main():
    out_dir = B.HERE / "drupe"
    out_dir.mkdir(exist_ok=True)
    B.OUT = out_dir
    original = B.CONCEPTS[0]
    ref = B.mark(original, "dark", title="Original Drupe mark", size=96)
    B.CONCEPTS = VARIANTS
    B.SECTION_LABEL = "Version"
    B.build_files()
    copy = {**COPY, "ref_html": ref}
    (out_dir / "index.html").write_text(B.page(copy=copy), encoding="utf-8")
    art = os.environ.get("ARTIFACT_OUT")
    if art:
        Path(art).write_text(B.page(fragment=True, copy=copy), encoding="utf-8")
    print("built", len(list(out_dir.glob("*.svg"))), "svg files + drupe/index.html")


if __name__ == "__main__":
    main()
