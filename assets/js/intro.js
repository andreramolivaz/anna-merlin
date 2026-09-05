/* The signature that writes itself, then steps aside.
   Paths and timings unchanged from the original intro page. */

(() => {
  /* ---- timings ------------------------------------------------- */
  const CONFIG = {
    writeSpeed: 700,   /* viewBox units per second, writing   */
    eraseSpeed: 1500,  /* the same, erasing                   */
    penLift: [90, 70], /* real pauses: word space, lift for n */
    holdMs: 560,       /* whole signature on screen           */
    fadeMs: 520        /* fade through to the field           */
  };
  /* -------------------------------------------------------------- */

  const intro = document.getElementById("intro");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let started = false;
  let leaving = false;

  const penPaths = [
    document.querySelector(".pen-anna"),
    document.querySelector(".pen-merli"),
    document.querySelector(".pen-n")
  ];

  const erasers = [
    document.querySelector(".eraser-n"),
    document.querySelector(".eraser-merli"),
    document.querySelector(".eraser-anna")
  ];

  const iDot = document.querySelector(".i-dot");
  const finalDot = document.querySelector(".final-dot");

  function dot(element, delay, show) {
    const from = show ? ".35" : "1";
    const to = show ? "1" : ".3";
    element.animate([
      { opacity: show ? 0 : 1, transform: `scale(${from})` },
      { opacity: show ? 1 : 0, transform: `scale(${to})` }
    ], {
      duration: show ? 150 : 120,
      delay,
      easing: show ? "cubic-bezier(.22, 1, .36, 1)" : "ease-in",
      fill: "forwards"
    });
  }

  function runHandwriting() {
    const strokes = penPaths.map((path) => {
      const length = path.getTotalLength();
      /* gap twice the dash: see the note in intro.css. An equal gap puts
         the end of the path on a dash boundary, and the round linecap
         draws that zero-length dash as a visible dot. */
      path.style.strokeDasharray = length + " " + length * 2;
      path.style.strokeDashoffset = length;
      return { path, length };
    });

    /* One speed along every centreline: the pen does not slow down or
         restart between letters, so the gesture stays continuous even
         where the path closes on itself. */
    let cursor = 120;

    strokes.forEach(({ path, length }, index) => {
      const duration = (length / CONFIG.writeSpeed) * 1000;

      path.animate([
        { strokeDashoffset: length },
        { strokeDashoffset: 0 }
      ], { duration, delay: cursor, easing: "linear", fill: "forwards" });

      cursor += duration + (CONFIG.penLift[index] || 0);
    });

    /* The dot of the i and the full stop: the only real pen lifts. */
    const iDotIn = cursor + 30;
    const finalDotIn = iDotIn + 130;
    dot(iDot, iDotIn, true);
    dot(finalDot, finalDotIn, true);

    let t = finalDotIn + 150 + CONFIG.holdMs;
    dot(finalDot, t, false);
    dot(iDot, t + 60, false);
    t += 190;

    /* Rewound in true reverse order: n, merli, anna. The white strokes
       stay where they are; what moves is a black eraser tracing back
       over them from the tail, so nothing is left glowing. */
    erasers.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length + " " + length * 2;
      path.style.strokeDashoffset = length;

      const duration = Math.max(160, (length / CONFIG.eraseSpeed) * 1000);

      path.animate([
        { strokeDashoffset: length },
        { strokeDashoffset: 0 }
      ], { duration, delay: t, easing: "linear", fill: "forwards" });

      t += duration + 40;
    });

    return t;
  }

  /* The intro no longer sends you anywhere: the field is already
     underneath it, so it just gets out of the way. */
  function leave(delay = CONFIG.fadeMs) {
    if (leaving) return;
    leaving = true;
    /* the field starts moving as the ground fades, not after it */
    document.documentElement.classList.remove("intro-up");
    intro.classList.add("is-leaving");
    window.setTimeout(() => intro.classList.add("is-gone"), delay);
  }

  function start() {
    if (started) return;
    started = true;

    if (reducedMotion) {
      penPaths.forEach((path) => {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = 0;
      });
      iDot.style.opacity = 1;
      finalDot.style.opacity = 1;
      window.setTimeout(leave, 900);
      return;
    }

    const finishAt = runHandwriting();
    window.setTimeout(leave, finishAt + 60);
  }

  function boot() {
    /* No point playing it to a tab nobody is looking at. */
    if (document.visibilityState === "hidden") {
      document.addEventListener("visibilitychange", boot, { once: true });
      return;
    }

    /* The writing is a main-thread animation: every frame redraws a mask.
       Started while the plates are still being fetched and decoded it
       stutters, and Safari suffers far more than Chrome. So it waits for
       the field to report itself ready, and only then picks up the pen.
       The gallery caps that wait, so a slow connection cannot stall it. */
    if (window.PLATES && !document.body.classList.contains("plates-ready")) {
      document.addEventListener("plates:ready", () => {
        window.setTimeout(start, 260);
      }, { once: true });
      return;
    }

    window.setTimeout(start, 200);
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  /* Click or tap skips it. */
  intro.addEventListener("click", () => leave(420));

  intro.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      leave(420);
    }
  });
    })();
