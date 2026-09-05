# anna merlin — site

A static site. No build step, nothing to install: upload the folder to any
host, or run it locally with

    python3 -m http.server

`index.html` is the way in.

## Pages

| file | what it does |
|---|---|
| `index.html` | the home page: the signature, then the field of plates |
| `projects.html` | placeholder, still to write |
| `about.html` | placeholder, still to write |
| `home.html` | a doorway that sends you to `index.html` |
| `fonts.html` | a workbench for picking the tab hand; delete when done |

The mark also appears in the browser tab and on a phone home screen:
`assets/img/favicon.svg` plus the pngs beside it, and `site.webmanifest`.
The icon is the mark on a paper tile rather than bare, because browser
chrome is often dark and a taupe mark on dark disappears.

The signature used to be a page of its own, which meant it only played
when someone arrived by the front door — reload the gallery and you never
saw it. It now sits on top of the home page as an overlay, so it plays on
every load and every reload. Click or tap skips it.

It waits for the plates before it starts. The writing is a main-thread
animation — every frame redraws a mask — and started while eighteen images
are still being fetched and decoded it stutters. Safari feels that far more
than Chrome does. So `gallery.js` fires a `plates:ready` event once the
images have arrived, and the signature waits for it; a six-second cap in the
gallery means a slow connection cannot stall it.

Three things were competing with it, and all three are gone:

- The field ran its animation loop behind the intro, transforming eighteen
  elements every frame at exactly the moment the signature needed the main
  thread. It now parks itself while `html.intro-up` is set, and the stage is
  `visibility: hidden` so nothing is composited either.
- Twelve plates carried `mix-blend-mode: multiply`. The page colour is baked
  into those files instead — see below.
- The fade out animated a `filter: blur()`, which is repainted on the main
  thread every frame. Opacity and transform do the same job on the
  compositor.

One thing worth knowing about how it is drawn. The mark is a filled vector
path, revealed through a mask by a stroke tracing the real centreline of the
signature. The dash pattern that does the revealing has a gap twice the
length of the dash, and that is not arbitrary: with an equal gap, the far end
of each path lands exactly where the next dash begins, and a round linecap
draws that zero-length dash as a dot. It left two white specks hanging ahead
of the pen. If you ever touch `stroke-dasharray`, keep the gap long.

## Colour

All of it sits at the top of `assets/css/site.css` as variables.

    --paper       #EFEEEC   the page
    --ink         #171614   type
    --brown       #887C6E   the mark, the intro ground, the writing
    --mark        #887C6E   anna's mark, taken off the portfolio cover

One brown does three jobs: the mark top left, the ground the signature is
written on, and the writing that the tabs turn into. The signature itself
is white on that brown — that is `--intro-ink`, at the top of
`assets/css/intro.css`.

## Type

`--font-sans` leads with **Nirmala UI**, which is what the
portfolio pdf is set in — I read it out of the file. Windows machines have
it; everywhere else **Source Sans 3** at weight 300 stands in, which is the
closest match in metrics and colour. That is the voice of the site.

## The tabs

Hovering a tab swaps the set type for an informal hand in the brown of the
mark, and the tab of the page you are on stays in that hand.

The word is not simply swapped in: it is **written out from the left**, the
same idea as the signature in the intro, at the top of the page instead. A
clip travelling left to right does it, which is why it works with a typeface
and does not need every letter drawn as a path.

The typeface is **Indie Flower** — upright, monoline and round, the register
of anna's letterforms. The set type is uppercase and widely tracked; the
writing is lowercase, the way she signs.

Two traps worth knowing. The uppercase lives on `.set` and not on the rule
both spans share — on the shared rule it wins on specificity and the writing
comes out in capitals. And the clip is given slack above and below
(`inset(-40% … -40% …)`): it must only travel sideways, or it shaves the
tail of the j and the top of the b and the t.

Coming back off a tab, the set type waits 470ms before fading in — the time
the writing needs to rub itself out. Without the wait the two sit on top of
each other for a moment. Going in there is no wait, so the set type is gone
before the first letter is written.

Open **`fonts.html`** to see the candidates side by side, large and at the
size they actually appear in the header. To change it, edit `--font-hand` in
`assets/css/site.css` and match the name in the Google Fonts link at the top
of each page. That page is a tool, not part of the site — nothing links to
it, and you can delete it once you have decided.

Both hands sit in the same grid cell, so nothing shifts when they swap.

## The plates

Eighteen of them, listed in `assets/js/plates.js` — one line each, with
title, project and year. Sixteen more are sitting in `assets/img` and listed
under `PLATES_SPARE` at the bottom of the same file; move a line up into
`PLATES` to bring one back.

`kind` matters. `photo` covers photographs and renders. `draw` covers line
and pencil work.

`ground: "white"` marks the pieces that were shot or scanned against a white
sheet — the model photographs, mostly. Those, and every drawing, need that
sheet to fall away so the work sits on the paper rather than in a white box.

That used to be `mix-blend-mode: multiply`, done by the browser on every
frame. It is now baked into the files. Multiplying against a flat backdrop is
exactly a per-channel scale by backdrop/255, so the result is identical and
the compositor has nothing to do. `assets/bake-paper.py` is what does it —
run it from the site root after adding a plate marked `ground: "white"`, or
after changing `--paper`. **It is not idempotent: baking twice darkens
twice.**

A render or a dark photograph has a ground of its own and must not carry the
flag, or the page would eat into the picture itself. If you add a plate, look
at it on the paper colour before deciding.

`w` and `h` are the real pixel dimensions of the file, and they are not
decoration: a plate is never shown wider than `w / TUNE.grain`, so a piece
that came out of the pdf small simply sits smaller rather than being blown
up soft. The same holds in full view. If you add a plate, put its true size
in, or it will be sized as though it had pixels it does not have.

The bamboo u photographs came out of the pdf too coarse to hold their own
next to the rest, and are gone from the folder.

## How the field moves

`assets/js/gallery.js`. The plates sit on an endless plane: each one lives
inside a tile larger than the window, and every frame its position is folded
back into that tile, so the plane seams up beyond the edge of the screen.

The numbers to turn are in `TUNE`, at the top:

    depths    how far each depth follows the gesture
    pull      push from the pointer
    ease      how softly the plane chases
    drift     slow wander when nobody is touching
    friction  tail after a drag
    tile      tile size against the window — this is the air
    tall      cap on a plate's height, as a multiple of its width

Want it busier? Lower `tile`. Want more empty space? Raise it.

## What responds to what

Pointer toward an edge and the field drifts the other way. Drag, with a
tail. Wheel. Arrow keys. Click or tap a plate to open it full size; Escape,
the cross, or a click outside closes it.

Tabbing moves between plates, and the focused one is carried to the middle
of the field on its own.

Anyone who has asked their system to reduce motion doesn't get the automatic
drift: the field only moves when they move it.
