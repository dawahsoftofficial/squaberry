"""Exports the chosen logo (Pop mark, Tonal violet) for the site.

Run from the repo root:  python design/logo-concepts/build_final.py
Writes:
  public/assets/squaberry-logo-fraunces.svg   lock-up for dark backgrounds (header, footer, admin)
  app/icon.svg, app/favicon.ico, app/apple-icon.png, public/icon-192.png, public/icon-512.png
  design/logo-concepts/final/              lock-ups for dark and light, marks, icons
Needs Playwright (Chromium) to measure the lock-up and rasterise the PNG icons, and Pillow for the .ico.
"""
import io
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image
from playwright.sync_api import sync_playwright

import build as B
import build_colour as C
from build import CHARCOAL, WHITE, f

ROOT = B.HERE.parent.parent
FINAL = B.HERE / "final"
TONAL = next(t for t in C.TREATMENTS if t["id"] == "tonal")
LOGO = C.concept(TONAL)
TILE = "#1C1C1C"
# Wordmark in the site's heading face: Fraunces 600 with its soft, wonky forms (as h1-h4 in globals.css).
WORD_FONT = TTFont(B.HERE / "fonts" / "fraunces-latin.woff2")
WORD_AXES = {"SOFT": 100, "WONK": 1, "opsz": 72}
WORD = ("squaberry", 600, -30)  # tracking in font units: -0.015em, as the headings
WORD_SIZE = 58  # x-height matches the old Bricolage wordmark at 54


def lockup_inner(mode, word_ink):
    """Mark (0-100 box) + wordmark, in lock-up units; returns (inner svg, width)."""
    text, wght, track = WORD
    size = WORD_SIZE
    d, tw = B.wordmark(text, wght, track, size, font=WORD_FONT, axes=WORD_AXES)
    gap = 22
    xh = WORD_FONT["OS/2"].sxHeight * size / WORD_FONT["head"].unitsPerEm
    baseline = 50 + xh / 2 + 1
    m = LOGO["fn"](B.uid("t"), mode=mode, ink=word_ink)
    inner = f'<g>{m}</g><path transform="translate({f(100 + gap)} {f(baseline)})" d="{d}" fill="{word_ink}"/>'
    return inner, 100 + gap + tw


def tight_viewbox(page, inner, w):
    """Measure the drawn content so the file has no empty margin (the mark's 100-unit box has padding)."""
    page.set_content(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} 100" width="{f(w * 4)}" '
                     f'height="400"><g id="all">{inner}</g></svg>')
    bb = page.evaluate("(() => { const b = document.getElementById('all').getBBox(); return [b.x, b.y, b.width, b.height]; })()")
    x, y, bw, bh = bb
    return x, y, bw, bh


def lockup_svg(page, mode, word_ink, title="Squaberry"):
    inner, w = lockup_inner(mode, word_ink)
    x, y, bw, bh = tight_viewbox(page, inner, w)
    vb = f"{f(x)} {f(y)} {f(bw)} {f(bh)}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img"><title>{title}</title>{inner}</svg>',
            bw / bh)


def icon_svg(page, size, fill, rx=0, small=True):
    """Square charcoal tile with the mark centred on its drawn shape (not its 100-unit box, which it overhangs).
    fill = share of the tile the mark's taller side takes, so the padding is even on every side."""
    m = LOGO["fn"](B.uid("i"), mode="dark", small=small)
    page.set_content(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">'
                     f'<g id="m">{m}</g></svg>')
    x, y, bw, bh = page.evaluate("(() => { const b = document.getElementById('m').getBBox(); return [b.x, b.y, b.width, b.height]; })()")
    k = size * fill / max(bw, bh)
    tx = size / 2 - (x + bw / 2) * k
    ty = size / 2 - (y + bh / 2) * k
    tile = f'<rect width="{size}" height="{size}"{f" rx={chr(34)}{f(rx)}{chr(34)}" if rx else ""} fill="{TILE}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">{tile}'
            f'<g transform="translate({f(tx)} {f(ty)}) scale({f(k)})">{m}</g></svg>')


def png(page, svg_text, px):
    page.set_viewport_size({"width": px, "height": px})
    page.set_content(f'<html><body style="margin:0;background:transparent">'
                     f'{svg_text.replace("<svg ", f"<svg width={chr(34)}{px}{chr(34)} height={chr(34)}{px}{chr(34)} ", 1)}'
                     f'</body></html>')
    return Image.open(io.BytesIO(page.screenshot(omit_background=True, clip={"x": 0, "y": 0, "width": px, "height": px})))


def main():
    FINAL.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()
        dark, ratio = lockup_svg(page, "dark", WHITE)
        light, _ = lockup_svg(page, "light", CHARCOAL)
        (ROOT / "public/assets/squaberry-logo-fraunces.svg").write_text(dark + "\n", encoding="utf-8")
        (FINAL / "squaberry-logo-dark.svg").write_text(dark + "\n", encoding="utf-8")
        (FINAL / "squaberry-logo-light.svg").write_text(light + "\n", encoding="utf-8")
        mark_tight = B.svg(LOGO["fn"](B.uid("m"), mode="dark"), vb="15 9.5 69.5 85.5", title="Squaberry")
        (ROOT / "public/assets/squaberry-mark-tonal.svg").write_text(mark_tight + chr(10), encoding="utf-8")
        (FINAL / "squaberry-mark-dark.svg").write_text(B.mark(LOGO, "dark", title="Squaberry") + "\n", encoding="utf-8")
        (FINAL / "squaberry-mark-light.svg").write_text(B.mark(LOGO, "light", title="Squaberry") + "\n", encoding="utf-8")

        # Favicon: rounded charcoal tile, chunkier small cut of the mark, even padding all round.
        fav = icon_svg(page, 64, 0.74, rx=15)
        (ROOT / "app/icon.svg").write_text(fav + "\n", encoding="utf-8")
        (FINAL / "favicon.svg").write_text(fav + "\n", encoding="utf-8")
        ico = [png(page, fav, s) for s in (16, 32, 48)]
        ico[-1].save(ROOT / "app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=ico[:-1])
        # Full-bleed tiles: iOS and Android mask the corners themselves; the mark stays inside the safe zone.
        png(page, icon_svg(page, 180, 0.64), 180).save(ROOT / "app/apple-icon.png")
        for s in (192, 512):
            png(page, icon_svg(page, s, 0.54, small=False), s).save(ROOT / f"public/icon-{s}.png")
        png(page, icon_svg(page, 512, 0.54, small=False), 512).save(FINAL / "app-icon-512.png")
        b.close()
    print(f"lock-up ratio {ratio:.4f} (width / height)")


if __name__ == "__main__":
    main()
