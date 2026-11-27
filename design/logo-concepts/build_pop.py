"""Pop, refined: the popped square becomes the leaf shape from Three. Writes SVGs and a review page to
design/logo-concepts/pop/, leading with large lock-ups (mark on the left, wordmark on the right).

Run from the repo root:  python design/logo-concepts/build_pop.py
ARTIFACT_OUT=<path> also writes the Artifact fragment.
"""
import os
from pathlib import Path

import build as B
import build_drupe as D

POP = {
    "id": "pop", "name": "Pop", "tag": "Popped leaf", "fn": D.mark_pop_leaf,
    "word": D.WORD, "word_size": D.WORD_SIZE, "drop": True,
    "line": "Five soft squares in a 3-2-1 berry, with the sixth popped out of the top-right corner as a leaf: "
            "a square turning into a berry.",
    "notes": [
        "The leaf now matches Three: a square with two opposite corners fully rounded, tip pointing up and out.",
        "Lavender leaf on charcoal, violet on cream, the same ink as the squares in one colour.",
        "Favicon cut uses wider squares and a bigger leaf so it holds at 16px.",
    ],
    "motion": "Squares drop in row by row, then the leaf lands in the corner.",
}


def showcase():
    def lk(mode, word, mark_ink=B.WHITE, cls="lockup"):
        return B.lockup(POP, mode, word, mark_ink, cls=cls, title="Squaberry logo, Pop")[0]
    return f"""
  <section class="showcase" aria-label="Pop logo with the wordmark">
    <div class="lk lk-dark">{lk("dark", B.WHITE)}</div>
    <div class="lk lk-cream">{lk("light", B.CHARCOAL)}</div>
    <div class="showcase-pair">
      <div class="lk lk-grad">{lk("mono", B.WHITE)}</div>
      <div class="lk lk-cream">{lk("mono", B.CHARCOAL, B.CHARCOAL)}</div>
    </div>
  </section>"""


def main():
    out_dir = B.HERE / "pop"
    out_dir.mkdir(exist_ok=True)
    old_pop = next(v for v in D.VARIANTS if v["id"] == "drupe-pop")
    ref = B.lockup(old_pop, "dark", B.WHITE, title="Previous Pop lock-up", height=56)[0]
    B.OUT = out_dir
    B.CONCEPTS = [POP]
    B.SECTION_LABEL = "Version"
    B.build_files()
    copy = {
        "title": "Squaberry Pop Logo",
        "eyebrow": "Brand exploration · Pop · not live",
        "h1": "Pop, with the wordmark",
        "lead": "The popped square now uses the leaf shape from Three. Below: the logo with the wordmark on the right, "
                "on charcoal, cream and the gradient, then every size and context.",
        "ref_label": "Previous Pop, with the square leaf",
        "ref_html": ref,
        "overview": False,
        "showcase": showcase(),
        "cmp_h": "In a row",
        "rec": """<h3>Next steps if you like it</h3>
      <p>Hand-kern the wordmark, then set the mark-to-text spacing and the minimum size.</p>
      <p>Then swap it into the site: header, footer, favicon, app icons and share cards.</p>""",
    }
    (out_dir / "index.html").write_text(B.page(copy=copy), encoding="utf-8")
    art = os.environ.get("ARTIFACT_OUT")
    if art:
        Path(art).write_text(B.page(fragment=True, copy=copy), encoding="utf-8")
    print("built", len(list(out_dir.glob("*.svg"))), "svg files + pop/index.html")


if __name__ == "__main__":
    main()
