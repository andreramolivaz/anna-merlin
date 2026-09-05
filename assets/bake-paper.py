"""
Bake the page colour into every plate that stands on a white sheet.

Multiplying an image against a flat backdrop is exactly a per-channel scale
by backdrop/255, so this gives the same result mix-blend-mode used to — and
lets the browser drop a dozen blended layers. Blended layers were what made
the field expensive to composite while the signature was writing, and Safari
felt it far more than Chrome.

Run from the site root after adding a plate marked ground:"white", or after
changing --paper. It is not idempotent: baking twice darkens twice.

    python3 assets/bake-paper.py
"""
from PIL import Image
import numpy as np
import os
import re

PAPER = (239, 238, 236)          # --paper, #EFEEEC

rows = re.findall(
    r'src: "assets/img/([\w-]+)\.jpg",.*?kind: "(\w+)",(\s+ground: "white",)?',
    open("assets/js/plates.js", encoding="utf-8").read())

lut = [np.array([min(255, round(v * PAPER[c] / 255)) for v in range(256)], dtype=np.uint8)
       for c in range(3)]

for slug in sorted({s for s, kind, ground in rows if kind == "draw" or ground}):
    path = f"assets/img/{slug}.jpg"
    if not os.path.exists(path):
        continue
    a = np.array(Image.open(path).convert("RGB"))
    for c in range(3):
        a[:, :, c] = lut[c][a[:, :, c]]
    Image.fromarray(a).save(path, "JPEG", quality=84, optimize=True, progressive=True)
    print("baked", slug)
