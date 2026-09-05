/* =========================================================================
   The field.

   The plates sit on an endless plane. Each one lives inside a tile larger
   than the window, and every frame its position is folded back into that
   tile — so the plane seams up beyond the edge of the screen and the field
   has no beginning and no end.

   Three depths move at different speeds: smaller plates hang back, the
   front ones follow the gesture.
   ========================================================================= */

(() => {
  const stage    = document.getElementById("stage");
  const readout  = document.getElementById("readout");
  const hint     = document.getElementById("hint");
  const lens     = document.getElementById("lens");
  const lensImg  = document.getElementById("lens-img");
  const lensCap  = document.getElementById("lens-cap");
  const lensShut = document.getElementById("lens-close");

  if (!stage || !window.PLATES) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TUNE = {
    depths:   [0.58, 0.8, 1],    /* how far each depth follows the gesture */
    scales:   [0.76, 0.9, 1],    /* and how large it is                    */
    pull:     1.15,              /* push from the pointer                  */
    ease:     0.085,             /* how softly the plane chases            */
    drift:    0.24,              /* slow wander when nobody is touching    */
    friction: 0.93,              /* tail after a drag                      */
    wheel:    1.15,
    tile:     [1.78, 1.78],      /* tile size against the window: the air  */
    tall:     1.2,               /* cap on a plate's height, times width   */
    grain:    1.7                /* source pixels per css pixel, at least  */
  };

  /* ---------------------------------------------------------- the field */

  const plates = [];
  let tileW = 0, tileH = 0;
  let baseWidth = 0;

  /* Size the plates, then work out the tile that holds them. The tile has
     to clear the window by more than one and a half plates on both axes —
     that is what keeps the seam off screen. */
  function layout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const narrow = vw < 760;

    baseWidth = narrow ? vw * 0.62 : Math.min(380, vw * 0.26);

    let maxW = 0, maxH = 0;

    for (const p of plates) {
      const grain = p.item.kind === "draw" ? 0.88 : 1;
      let w = baseWidth * TUNE.scales[p.depth] * grain * p.grain;

      /* Not every plate came out of the pdf at the same resolution. Rather
         than let a small one be blown up soft, it is held to a size its own
         pixels can carry — so the coarser pieces simply sit smaller. */
      w = Math.min(w, p.item.w / TUNE.grain);

      /* very tall plates get narrower rather than towering over the rest */
      const ratio = p.item.h / p.item.w;
      if (ratio > TUNE.tall) w *= TUNE.tall / ratio;
      const h = w * ratio;
      p.w = w;
      p.h = h;
      p.el.style.width = w + "px";
      if (w > maxW) maxW = w;
      if (h > maxH) maxH = h;
    }

    tileW = Math.max(vw * TUNE.tile[0], vw + maxW * 1.9);
    tileH = Math.max(vh * TUNE.tile[1], vh + maxH * 1.9);

    for (const p of plates) {
      p.bx = p.nx * tileW;
      p.by = p.ny * tileH;
    }
  }

  /* a scatter that is random-looking but always the same: the field is
     composed, not drawn from a hat */
  function noise(i, salt) {
    const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return v - Math.floor(v);
  }

  function build() {
    const data = window.PLATES;
    const n    = data.length;
    const shape = (window.innerWidth * TUNE.tile[0]) /
                  (window.innerHeight * TUNE.tile[1]);
    const cols  = Math.max(4, Math.round(Math.sqrt(n * shape)));
    const rows = Math.ceil(n / cols);
    const frag = document.createDocumentFragment();

    /* One copy of each plate. A second pass at [0.5, 0.5] would double the
       density without ever showing both copies at once — useful if the
       field ever needs filling, but the point here is the empty space. */
    const COPIES = [[0, 0]];

    const place = (item, i, copy) => {
      const depth = i % 3;

      const el = document.createElement("button");
      el.className = "plate";
      el.type = "button";
      el.dataset.kind = item.kind;
      
      /* Any extra copy is the same plate seen elsewhere on the plane, so it
         stays silent for keyboard and screen readers: the portfolio is
         walked through once. */
      if (copy === 0) {
        el.setAttribute(
          "aria-label",
          `${item.title} — ${item.project}, ${item.year}. Open full view`
        );
      } else {
        el.tabIndex = -1;
        el.setAttribute("aria-hidden", "true");
      }

      const img = document.createElement("img");
      /* Two sizes on offer, and the browser picks. A phone draws a plate
         about 240 css pixels wide, so even at three device pixels each it
         wants the 720 — a fifth of the area the desktop needs. Serving the
         large one to a phone cost several seconds on a mobile connection,
         and the signature was left waiting for it. */
      const small = item.src.replace(".jpg", "-sm.jpg");
      /* Held back, not loaded. The signature writes on an idle page and the
         plates start arriving once the pen is down — see the bottom of the
         file. Sources sit in data- until then. */
      img.dataset.src = small;
      img.dataset.srcset = `${small} 720w, ${item.src} ${item.w}w`;
      img.sizes = "(max-width: 760px) 46vw, min(26vw, 380px)";
      img.alt = "";
      img.width = item.w;
      img.height = item.h;
      img.decoding = "async";
      img.fetchPriority = "low";   /* never ahead of the stylesheet or the intro */
      img.draggable = false;
      el.appendChild(img);

      /* A staggered grid in 0-to-1 coordinates: each plate starts from its
         own cell and wanders a little out of it. */
      const col = i % cols;
      const row = Math.floor(i / cols);
      const [ox, oy] = COPIES[copy];

      const nx = ((col + 0.5 + (noise(i, 1) - 0.5) * 0.72) / cols + ox) % 1;
      let   ny = (row + 0.5 + (noise(i, 2) - 0.5) * 0.72) / rows
               + (col % 2 ? 0.22 / rows : 0) + oy;
      ny = ((ny % 1) + 1) % 1;

      el.dataset.plate = plates.length;

      plates.push({
        el, item, depth,
        nx, ny,
        w: 0, h: 0, bx: 0, by: 0,
        grain: 0.84 + noise(i, 3) * 0.36
      });

      frag.appendChild(el);
    };

    COPIES.forEach((_, c) => data.forEach((item, i) => place(item, i, c)));

    stage.appendChild(frag);
  }

  /* ------------------------------------------------------------- motion */

  const s = {
    x: 0, y: 0, tx: 0, ty: 0,
    vx: 0, vy: 0,
    px: 0, py: 0,
    pointerIn: false,
    dragging: false,
    dragX: 0, dragY: 0, moved: 0, pressed: null,
    touched: false,
    driftA: Math.random() * Math.PI * 2
  };

  /* The seam is pushed out by a whole plate: by the time one jumps, it is
     already fully past the left edge, so the plane never visibly stitches. */
  function wrap(v, size, span) {
    const m = (v + span) % size;
    return (m < 0 ? m + size : m) - span;
  }

  function frame() {
    /* Nothing moves while the signature is writing. Eighteen transformed
       elements per frame is real work, and on the main thread it is the
       same work the animation needs. */
    if (document.documentElement.classList.contains("intro-up")) {
      requestAnimationFrame(frame);
      return;
    }

    if (!s.dragging) {
      if (s.pointerIn) {
        /* pointer toward an edge pulls the field the other way */
        const dx = (s.px / window.innerWidth  - 0.5) * -2;
        const dy = (s.py / window.innerHeight - 0.5) * -2;
        s.tx += dx * TUNE.pull;
        s.ty += dy * TUNE.pull;
      } else if (!reduced) {
        s.driftA += 0.0016;
        s.tx += Math.cos(s.driftA) * TUNE.drift;
        s.ty += Math.sin(s.driftA * 0.7) * TUNE.drift;
      }

      s.tx += s.vx;
      s.ty += s.vy;
      s.vx *= TUNE.friction;
      s.vy *= TUNE.friction;
    }

    s.x += (s.tx - s.x) * TUNE.ease;
    s.y += (s.ty - s.y) * TUNE.ease;

    for (const p of plates) {
      const x = wrap(p.bx + s.x * TUNE.depths[p.depth], tileW, p.w) - p.w / 2;
      const y = wrap(p.by + s.y * TUNE.depths[p.depth], tileH, p.h) - p.h / 2;
      p.el.style.transform =
        `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }

    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ controls */

  function used() {
    if (s.touched) return;
    s.touched = true;
    hint && hint.classList.add("is-off");
  }

  stage.addEventListener("pointermove", (e) => {
    s.px = e.clientX;
    s.py = e.clientY;
    s.pointerIn = true;

    if (s.dragging) {
      const dx = e.clientX - s.dragX;
      const dy = e.clientY - s.dragY;
      s.tx += dx;
      s.ty += dy;
      s.vx = dx * 0.35;
      s.vy = dy * 0.35;
      s.moved += Math.abs(dx) + Math.abs(dy);
      s.dragX = e.clientX;
      s.dragY = e.clientY;
    }
  });

  stage.addEventListener("pointerleave", () => { s.pointerIn = false; });

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    s.dragging = true;
    s.dragX = e.clientX;
    s.dragY = e.clientY;
    s.moved = 0;
    /* Pointer capture delivers the click to the stage rather than to the
       plate, so the pressed plate has to be remembered here. */
    s.pressed = e.target.closest(".plate");
    stage.classList.add("is-dragging");
    stage.setPointerCapture(e.pointerId);
    used();
  });

  function release() {
    s.dragging = false;
    s.pressed = null;
    stage.classList.remove("is-dragging");
  }

  stage.addEventListener("pointerup", (e) => {
    /* a drag is not a click */
    if (s.pressed && s.moved < 7) open(+s.pressed.dataset.plate);
    release();
  });

  stage.addEventListener("pointercancel", release);

  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    s.tx -= e.deltaX * TUNE.wheel;
    s.ty -= e.deltaY * TUNE.wheel;
    used();
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    const step = 120;
    if (e.key === "ArrowLeft")  { s.tx += step; used(); }
    if (e.key === "ArrowRight") { s.tx -= step; used(); }
    if (e.key === "ArrowUp")    { s.ty += step; used(); }
    if (e.key === "ArrowDown")  { s.ty -= step; used(); }
  });

  /* ---------------------------------------------------------- caption */

  function caption(item) {
    return `<b>${item.title}</b><br>${item.project} <span>·</span> ${item.year}`;
  }

  /* Touch has no "over": the caption and the stepping back of the other
     plates only make sense where there is a real pointer. */
  if (window.matchMedia("(hover: hover)").matches) {
    stage.addEventListener("pointerover", (e) => {
      const el = e.target.closest(".plate");
      if (!el) return;
      const p = plates[+el.dataset.plate];
      stage.classList.add("is-hovering");
      el.classList.add("is-hot");
      readout.innerHTML = caption(p.item);
      readout.classList.add("is-on");
    });

    stage.addEventListener("pointerout", (e) => {
      const el = e.target.closest(".plate");
      if (!el || el.contains(e.relatedTarget)) return;
      el.classList.remove("is-hot");
      stage.classList.remove("is-hovering");
      readout.classList.remove("is-on");
    });
  }

  /* -------------------------------------------------------- full view */

  let lastFocus = null;

  function open(i) {
    const p = plates[i];
    lensImg.src = p.item.src;
    lensImg.alt = `${p.item.title} — ${p.item.project}`;
    /* the same courtesy in full view: never shown wider than it really is.
       As a custom property, so the stylesheet can still cap it to the
       viewport — an inline max-width would win and overflow a phone. */
    lensImg.style.setProperty("--natural", Math.min(p.item.w, 1200) + "px");
    lensImg.dataset.kind = p.item.kind;
    lensCap.innerHTML = caption(p.item);
    lens.classList.add("is-open");
    lens.setAttribute("aria-hidden", "false");
    lastFocus = document.activeElement;
    lensShut.focus();
  }

  function close() {
    lens.classList.remove("is-open");
    lens.setAttribute("aria-hidden", "true");
    lastFocus && lastFocus.focus();
  }

  /* Someone on a keyboard cannot chase a plate that is off screen, so the
     plane moves to bring it to the middle. */
  stage.addEventListener("focusin", (e) => {
    const el = e.target.closest(".plate");
    if (!el) return;
    const p = plates[+el.dataset.plate];
    const r = el.getBoundingClientRect();
    const f = TUNE.depths[p.depth];
    /* the plane chases s.x, not s.tx: aim from where it actually is */
    s.tx = s.x + (window.innerWidth  / 2 - (r.left + r.width  / 2)) / f;
    s.ty = s.y + (window.innerHeight / 2 - (r.top  + r.height / 2)) / f;
    readout.innerHTML = caption(p.item);
    readout.classList.add("is-on");
  });

  stage.addEventListener("focusout", (e) => {
    if (!e.target.closest(".plate")) return;
    readout.classList.remove("is-on");
  });

  /* Enter and space on a focused plate: e.detail is 0 only when the click
     did not come from a pointer. */
  stage.addEventListener("click", (e) => {
    if (e.detail !== 0) return;
    const el = e.target.closest(".plate");
    if (el) open(+el.dataset.plate);
  });

  lensShut.addEventListener("click", close);
  lens.addEventListener("click", (e) => { if (e.target === lens) close(); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lens.classList.contains("is-open")) close();
  });

  /* ------------------------------------------------------------- start */

  build();
  layout();
  requestAnimationFrame(frame);

  let settle;
  window.addEventListener("resize", () => {
    clearTimeout(settle);
    settle = setTimeout(layout, 180);
  });

  /* Fetching the plates is what used to make the signature stutter, and
     waiting for them first is what left the screen brown for seconds. So
     neither: the writing starts at once on an idle page, and the plates are
     asked for only once the pen has finished the last letter. The holding,
     erasing and fading that follow cover the wait. */
  const imgs = [...stage.querySelectorAll("img")];
  let left = imgs.length;
  let fetching = false;
  let shown = false;

  function reveal() {
    if (shown) return;
    shown = true;
    stage.classList.add("is-ready");
  }

  function fetchPlates() {
    if (fetching) return;
    fetching = true;
    if (!left) return reveal();
    imgs.forEach((img) => {
      const tick = () => { if (--left <= 0) reveal(); };
      img.addEventListener("load", tick, { once: true });
      img.addEventListener("error", tick, { once: true });
      img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
    });
    /* however slow the line, the field does not stay invisible forever */
    setTimeout(reveal, 8000);
  }

  document.addEventListener("intro:written", fetchPlates, { once: true });

  /* no intro on this page, or it has already been and gone */
  if (!document.getElementById("intro") ||
      !document.documentElement.classList.contains("intro-up")) {
    fetchPlates();
  }
})();
