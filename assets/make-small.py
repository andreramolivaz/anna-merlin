"""
Write a small copy of every plate, for phones.

The field on a phone draws a plate about 240 css pixels wide, which even at
three device pixels each is 720 — a fifth of the area of the file the desktop
needs. Serving the large one to a phone was costing several seconds on a
mobile connection, and the signature had to wait for it.

Each plate therefore gets a -sm.jpg beside it, and the markup offers both
through srcset. The browser picks; a retina desktop still gets the large one.

    python3 assets/make-small.py
"""
from PIL import Image
import glob
import os

WIDE = 720

for path in sorted(glob.glob("assets/img/*.jpg")):
    if path.endswith("-sm.jpg"):
        continue
    im = Image.open(path)
    if im.width <= WIDE:                      # already small enough to serve as is
        im.save(path.replace(".jpg", "-sm.jpg"), "JPEG",
                quality=84, optimize=True, progressive=True)
        continue
    im = im.copy()
    im.thumbnail((WIDE, WIDE * 4), Image.LANCZOS)
    im.save(path.replace(".jpg", "-sm.jpg"), "JPEG",
            quality=82, optimize=True, progressive=True)

big = sum(os.path.getsize(f) for f in glob.glob("assets/img/*.jpg")
          if not f.endswith("-sm.jpg"))
sml = sum(os.path.getsize(f) for f in glob.glob("assets/img/*-sm.jpg"))
print(f"large {big/1048576:.2f} MB   small {sml/1048576:.2f} MB")
