"""
Sit every plate that stands on a white sheet exactly on the page colour.

The sheets these were shot and scanned on are not pure white — they run from
about 244 to 255, and they are not neutral either. A flat multiply therefore
leaves each one a few levels off the page, which reads as a faint box around
the picture. So each file is measured and mapped instead: whatever its own
sheet turns out to be is sent to exactly --paper, and the tones on either
side are stretched to follow, so nothing clips.

The sheet is read as the commonest pale tone in the whole picture, not from
the border. On several drawings the border carries contour lines rather than
paper, and a border reading brightens them until the drawing washes out.

This is idempotent: run it twice and the second pass measures a sheet that is
already the page colour, so the curve is flat. Run it from the site root
after adding a plate marked ground:"white", or after changing --paper.

    python3 assets/bake-paper.py
"""
from PIL import Image
import numpy as np
import os
import re

PAPER = (239, 238, 236)          # --paper, #EFEEEC
PALE = 200                       # below this a pixel is work, not sheet


def sheet_of(a):
    """The sheet the work stands on: the commonest pale tone in the picture."""
    flat = a.reshape(-1, 3)
    pale = flat[flat.mean(1) > PALE]
    if len(pale) < len(flat) * 0.05:          # no sheet worth speaking of
        return None
    return np.array([np.bincount(pale[:, c], minlength=256)[PALE:].argmax() + PALE
                     for c in range(3)], float)


def curve(src, dst):
    """Send src to dst, stretching the tone on each side of it to follow."""
    x = np.arange(256, dtype=float)
    below = x * (dst / src)
    above = x if src >= 255 else dst + (x - src) * ((255 - dst) / (255 - src))
    return np.where(x <= src, below, above).clip(0, 255).round().astype(np.uint8)


rows = re.findall(
    r'src: "assets/img/([\w-]+)\.jpg",.*?kind: "(\w+)",(\s+ground: "white",)?',
    open("assets/js/plates.js", encoding="utf-8").read())

paths = []
for slug in sorted({s for s, kind, ground in rows if kind == "draw" or ground}):
    # both sizes: a phone is served the -sm file, and a sheet left uncorrected
    # there shows as a box on exactly the screens hardest to check
    paths += [f"assets/img/{slug}.jpg", f"assets/img/{slug}-sm.jpg"]

for path in paths:
    slug = os.path.basename(path)[:-4]
    if not os.path.exists(path):
        continue

    a = np.array(Image.open(path).convert("RGB"))
    sheet = sheet_of(a)
    if sheet is None:
        print(f"  {slug:24s} no sheet found, left alone")
        continue
    # one level of slack: jpeg quantisation can round a channel by one, and
    # chasing that would rewrite the same files forever for no visible gain
    if np.abs(sheet - PAPER).max() <= 1:
        print(f"  {slug:24s} already on the page")
        continue

    for c in range(3):
        a[:, :, c] = curve(float(sheet[c]), PAPER[c])[a[:, :, c]]

    Image.fromarray(a).save(path, "JPEG", quality=86, optimize=True, progressive=True)
    after = sheet_of(np.array(Image.open(path).convert("RGB")))
    print(f"  {slug:24s} {tuple(sheet.astype(int))} -> {tuple(after.astype(int))}")
