"""Build app/fonts/fraunces-latin-soft-wonk.woff2, the heading font.

The site always sets Fraunces to SOFT 100 and WONK 1 (globals.css), so this downloads the Latin
variable font from Google Fonts and pins those two axes with fontTools. The glyphs look the same but
the file is about half the size (roughly 62kb instead of 121kb). The weight and optical-size axes stay
variable. Run with `python scripts/build-fraunces.py` (needs `pip install fonttools brotli`).
"""

import io
import re
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CSS_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,100..900,0..100,0..1&display=swap'
# Google Fonts only serves woff2 to browsers it recognises.
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
OUT = Path(__file__).resolve().parent.parent / 'app' / 'fonts' / 'fraunces-latin-soft-wonk.woff2'


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return response.read()


css = fetch(CSS_URL).decode()
latin = re.search(r'/\* latin \*/\s*@font-face\s*{[^}]*?url\((https://[^)]+\.woff2)\)', css)
if not latin:
    raise SystemExit('No Latin woff2 found in the Google Fonts CSS')

font = TTFont(io.BytesIO(fetch(latin.group(1))))
font = instancer.instantiateVariableFont(font, {'SOFT': 100, 'WONK': 1}, updateFontNames=False)
font.flavor = 'woff2'
OUT.parent.mkdir(parents=True, exist_ok=True)
font.save(OUT)
print(f'Wrote {OUT} ({OUT.stat().st_size:,} bytes)')
