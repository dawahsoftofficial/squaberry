"""Exports the chosen logo (Pop mark, Tonal violet) for the site.

Run from the repo root:  python design/logo-concepts/build_final.py
Writes:
  public/assets/squaberry-logo-tonal.svg   lock-up for dark backgrounds (header, footer, admin)
  app/icon.svg, app/favicon.ico, app/apple-icon.png, public/icon-192.png, public/icon-512.png
  design/logo-concepts/final/              lock-ups for dark and light, marks, icons
Needs Playwright (Chromium) to measure the lock-up and rasterise the PNG icons, and Pillow for the .ico.
"""
import io
from pathlib import Path

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


def lockup_inner(mode, word_ink):
    """Mark (0-100 box) + wordmark, in lock-up units; returns (inner svg, width)."""
    text, wght, track = LOGO["word"]
    size = LOGO["word_size"]
    d, tw = B.wordmark(text, wght, track, size)
    gap = 22
    xh = B.FONT["OS/2"].sxHeight * size / B.UPM
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


def icon_svg(size, scale, rx=0, small=True):
    """Square charcoal tile with the mark centred. scale = share of the tile the mark's 100-unit box fills."""
    m = LOGO["fn"](B.uid("i"), mode="dark", small=small)
    box = size * scale
    off = (size - box) / 2
    tile = f'<rect width="{size}" height="{size}"{f" rx={chr(34)}{f(rx)}{chr(34)}" if rx else ""} fill="{TILE}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">{tile}'
            f'<g transform="translate({f(off)} {f(off)}) scale({f(box / 100)})">{m}</g></svg>')


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
        (ROOT / "public/assets/squaberry-logo-tonal.svg").write_text(dark + "\n", encoding="utf-8")
        (FINAL / "squaberry-logo-dark.svg").write_text(dark + "\n", encoding="utf-8")
        (FINAL / "squaberry-logo-light.svg").write_text(light + "\n", encoding="utf-8")
        mark_tight = B.svg(LOGO["fn"](B.uid("m"), mode="dark"), vb="15 9.5 69.5 85.5", title="Squaberry")
        (ROOT / "public/assets/squaberry-mark-tonal.svg").write_text(mark_tight + chr(10), encoding="utf-8")
        (FINAL / "squaberry-mark-dark.svg").write_text(B.mark(LOGO, "dark", title="Squaberry") + "\n", encoding="utf-8")
        (FINAL / "squaberry-mark-light.svg").write_text(B.mark(LOGO, "light", title="Squaberry") + "\n", encoding="utf-8")

        # Favicon: rounded charcoal tile, chunkier small cut of the mark.
        fav = icon_svg(64, 0.84, rx=15)
        (ROOT / "app/icon.svg").write_text(fav + "\n", encoding="utf-8")
        (FINAL / "favicon.svg").write_text(fav + "\n", encoding="utf-8")
        ico = [png(page, fav, s) for s in (16, 32, 48)]
        ico[-1].save(ROOT / "app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=ico[:-1])
        # Full-bleed tiles: iOS and Android mask the corners themselves; the mark stays inside the safe zone.
        png(page, icon_svg(180, 0.66), 180).save(ROOT / "app/apple-icon.png")
        for s in (192, 512):
            png(page, icon_svg(s, 0.62, small=False), s).save(ROOT / f"public/icon-{s}.png")
        png(page, icon_svg(512, 0.62, small=False), 512).save(FINAL / "app-icon-512.png")
        b.close()
    print(f"lock-up ratio {ratio:.4f} (width / height)")


if __name__ == "__main__":
    main()
