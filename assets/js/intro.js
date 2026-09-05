/* The signature that writes itself, then steps aside.

   Every word is uncovered by a curtain that slides right. The only thing
   animated is a transform, so the whole sequence runs on the compositor —
   nothing here asks the main thread to redraw a mask or re-measure a path
   on each frame. */

(() => {
  /* ---- timings ------------------------------------------------------- */
  const CONFIG = {
    writeSpeed: 295,   /* viewBox units per second, writing */
    eraseSpeed: 640,   /* the same, rubbing out             */
    penLift:    90,    /* the pause between the two words   */
    holdMs:     560,   /* whole signature on screen         */
    fadeMs:     520    /* fade through to the field         */
  };
  /* -------------------------------------------------------------------- */

  const intro = document.getElementById("intro");
  const curtains = [...document.querySelectorAll(".word")].map((word) => ({
    el: word.querySelector(".curtain"),
    span: Number(word.dataset.span) || 250     /* how far the pen travels */
  }));

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let started = false;
  let leaving = false;

  const OFF = "translateX(101%)";              /* clear of the word */
  const ON = "translateX(0)";                  /* covering it       */

  function slide(curtain, from, to, duration, delay) {
    curtain.animate(
      [{ transform: from }, { transform: to }],
      { duration, delay, easing: "linear", fill: "forwards" }
    );
  }

  function run() {
    let t = 120;

    /* writing: each curtain clears its own word, with a lift between them */
    curtains.forEach(({ el, span }, i) => {
      const duration = (span / CONFIG.writeSpeed) * 1000;
      slide(el, ON, OFF, duration, t);
      t += duration + (i < curtains.length - 1 ? CONFIG.penLift : 0);
    });

    /* The pen is down. The field can start fetching now: the hold, the
       rubbing out and the fade cover the wait, and none of it competes
       with the writing itself. */
    window.setTimeout(
      () => document.dispatchEvent(new Event("intro:written")), t);

    t += CONFIG.holdMs;

    /* rubbing out, in true reverse order: the curtain comes back from the
       right, so the writing retreats from its tail towards its start */
    curtains.slice().reverse().forEach(({ el, span }) => {
      const duration = (span / CONFIG.eraseSpeed) * 1000;
      slide(el, OFF, ON, duration, t);
      t += duration + 40;
    });

    return t;
  }

  /* The intro does not send you anywhere: the field is already underneath
     it, so it simply gets out of the way. */
  function leave(delay = CONFIG.fadeMs) {
    if (leaving) return;
    leaving = true;
    /* skipped by a tap: the field should not sit waiting for a cue that is
       now three seconds away. The listener only fires once. */
    document.dispatchEvent(new Event("intro:written"));
    document.documentElement.classList.remove("intro-up");
    intro.classList.add("is-leaving");
    window.setTimeout(() => intro.classList.add("is-gone"), delay);
  }

  function start() {
    if (started) return;
    started = true;

    if (reducedMotion) {
      curtains.forEach(({ el }) => { el.style.transform = OFF; });
      document.dispatchEvent(new Event("intro:written"));
      window.setTimeout(leave, 900);
      return;
    }

    window.setTimeout(leave, run() + 60);
  }

  function boot() {
    /* No point playing it to a tab nobody is looking at. */
    if (document.visibilityState === "hidden") {
      document.addEventListener("visibilitychange", boot, { once: true });
      return;
    }
    window.setTimeout(start, 200);
  }

  /* Click, tap or key: skip it. */
  intro.addEventListener("click", () => leave(320));
  intro.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      leave(320);
    }
  });

  boot();
})();
