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

The writing is a main-thread animation — every frame redraws a mask — so
what it needs is an idle page. It gets one by ordering, not by waiting.

The order is: the pen goes down about 200ms in, on a page that has fetched
nothing but its own stylesheet. When the last letter is finished, `intro.js`
fires `intro:written` and only then does the field ask for its images. The
holding, the erasing and the fade cover that wait, so nothing is competing
with the writing and nothing is competing with the reader either. Tapping to
skip fires the same event, so the field is never left waiting for a cue three
seconds away.

An earlier attempt had this backwards — the signature waited for the images
instead. On a phone that meant several seconds of blank brown, and then the
writing ran anyway while the rest of the download was still arriving. Both
symptoms, one mistake.

Three other things were competing with it, and all three are gone:

- The field ran its animation loop behind the intro, transforming eighteen
  elements every frame at exactly the moment the signature needed the main
  thread. It now parks itself while `html.intro-up` is set, and the stage is
  `visibility: hidden` so nothing is composited either.
- Twelve plates carried `mix-blend-mode: multiply`. The page colour is baked
  into those files instead — see below.
- The fade out animated a `filter: blur()`, which is repainted on the main
  thread every frame. Opacity and transform do the same job on the
  compositor.

Payload matters too, and a phone was being sent the desktop pictures. Each
plate now has a `-sm.jpg` beside it at 720 pixels, offered through `srcset`;
`assets/make-small.py` writes them. A phone takes 1.16 MB where it used to
take 2.48, and a retina desktop still gets the large files. Run that script
after adding a plate, or its small copy will be missing.

### How it is drawn, and one thing not to try again

The mark is a filled vector path — the true outline of her signature —
revealed through an svg mask by a stroke that traces the real centreline.

I once replaced all that with the centreline stroked directly. It is far
cheaper: no mask buffer to rebuild each frame, and it took the page from
39 KB to 11 KB. It is also wrong, and the way it is wrong is worth writing
down. Her hand tapers — thin through the joins and the l and the i, full in
the loops — and a stroke of one width thickens exactly the parts that should
be light. I had calibrated the width by dividing the mark's area by the
length of its centreline, which gives 5.96 and looks right on a laptop at
310px. At 226px on a phone it read as heavy and blunt. The measurement was
not wrong; it was answering the wrong question, because an average cannot
carry a taper. The faithful version is back.

One trap: the gap in the dash pattern is twice the dash, and that is not
arbitrary. With an equal gap the far end of each path lands exactly where the
next dash begins — a dash of zero length, which a round linecap still draws
as a dot. It once left two white specks hanging in mid-air ahead of the pen.
If you touch `stroke-dasharray`, keep the gap long.

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

## If it stutters on a host but not on your laptop

Locally everything is already on the disk, so nothing competes with the
signature and it always looks smooth. Over a real connection the same page
has work arriving while the pen is moving, and the writing is a main-thread
animation — every frame redraws a mask. Safari feels that far more than
Chrome does.

So nothing at all is fetched while it writes. The plates keep their sources
in `data-src` until `intro:written` fires, and the web fonts are injected on
the same event. Measured from a cold load: zero image requests and zero font
requests before the pen goes down, all eighteen plates and the fonts
immediately after. The hold, the erasing and the fade cover the wait.

A narrow screen builds twelve plates rather than eighteen. Each one is a
composited layer the phone holds in graphics memory while the field drifts;
eighteen is nothing on a laptop and a real weight on a phone. Twelve is still
more than fit on screen at once, so the field looks no emptier.

`.nojekyll` sits in the root because GitHub Pages otherwise runs the repo
through Jekyll.


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
frame. It is baked into the files instead, so the compositor has nothing to
do. `assets/bake-paper.py` does it — run it from the site root after adding a
plate marked `ground: "white"`, or after changing `--paper`.

A flat multiply is not enough, and this is worth knowing before you touch it.
The sheets these were shot and scanned on are not pure white: they run from
about 244 to 255, and they are not neutral either. Multiplying all of them by
the same figure leaves each one a few levels off the page, which is exactly
the faint box it was meant to remove. So each file is measured and mapped —
its own sheet is sent to exactly `--paper`, and the tone on either side is
stretched to follow, so nothing clips.

The sheet is read as the commonest pale tone in the whole picture, not from
the border. On several of the drawings the border carries contour lines
rather than paper, and a border reading brightens them until the drawing
washes out. The script is idempotent, with one level of slack for jpeg
rounding.

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

## The full view

Laid out as a flex column that is told to fit, rather than a picture given a
height worked out by hand. The image is allowed to shrink — `min-height: 0`
is what permits that inside a flex column — and the caption keeps its own
row, so it cannot be pushed off the bottom of a phone. The padding leaves
room for the close button and for `env(safe-area-inset-*)`.

The natural width of a plate reaches the image as a custom property, not as
an inline `max-width`. An inline `max-width` beats the stylesheet, and a
1200px plate then runs off the side of a 390px phone — which is exactly what
it was doing.

## What responds to what

Pointer toward an edge and the field drifts the other way. Drag, with a
tail. Wheel. Arrow keys. Click or tap a plate to open it full size; Escape,
the cross, or a click outside closes it.

Tabbing moves between plates, and the focused one is carried to the middle
of the field on its own.

Anyone who has asked their system to reduce motion doesn't get the automatic
drift: the field only moves when they move it.
