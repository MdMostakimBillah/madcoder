import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

/**
 * Motion layer — GSAP owns scroll reveals, the section-to-section glide,
 * and the hover micro-interactions.
 *
 * ── Why there is a head script ────────────────────────────────────────────
 * "Hide, then animate" only reads as intentional if the hiding happens
 * *before first paint*. GSAP is a static import here: it ships inside this
 * island's chunk, fetched in the first wave alongside everything else, and
 * only *runs* once React hydrates this component — after the copy is on
 * screen, so setting opacity:0 then would look like the page blinking out.
 * (A dynamic import used to live here; its second round trip held the rail
 * empty for well over a second on a cold cache before the entrance could
 * begin.) The inline script in Base.astro therefore adds `html.motion` up
 * front and arms a failsafe in case we never boot.
 *
 * Boot sequence, in order:
 *   1. stand down the head script's failsafe
 *   2. register gsap + ScrollTrigger + ScrollToPlugin (bundled — no
 *      second fetch)
 *   3. write the same hidden state as inline styles — the below-the-fold
 *      reveals and the skill bars; the navigation chrome is CSS's to hide
 *      and to animate (see "Not GSAP's" below)
 *   4. create the ScrollTriggers and run the one-time refresh
 *   5. drop `html.motion` — last: the inline styles now hold those elements
 *      hidden, so removing the class changes nothing visually, and the
 *      refresh's reflow (setup's one long task) lands behind the gate
 *      instead of inside the entrance, where it used to stall the first
 *      frames for a sixth of a second while the content arrived.
 *   6. attach the section pager — a wheel flick, a swipe or a scroll key
 *      glides to the next section's stop (see the paging block below).
 *      Desktop only: below `lg` it never attaches, so phones and tablets
 *      keep plain native scrolling. Attached after boot on purpose: a
 *      failed setup falls back to native too, and the entrance never
 *      races a glide.
 *
 * Step 5 has to follow step 3: the other way round un-hides every element
 * whose trigger hasn't fired yet. Elements GSAP skips (anything without a
 * box at this breakpoint — the project sheet's copy, say, display:none
 * until its card opens) rely on that: they lose the prime class with no
 * inline styles, so they come back natural rather than stuck invisible
 * when the viewport changes.
 *
 * Every reveal ends with `clearProps`, which strips GSAP's inline styles so
 * the element settles on its exact layout position — no residual transform,
 * no sticky opacity.
 *
 * Reduced-motion visitors never get `html.motion`, so this returns before
 * touching anything and the CSS hover rules in the markup carry on alone.
 *
 * ── Not GSAP's: the navigation chrome ─────────────────────────────────────
 * The rail, the glass pills and the tab bar — everything carrying
 * `data-reveal` — are hidden, staggered and moved by CSS alone: `.railin`
 * and the `railIn` keyframe in global.css, with each element's delay
 * written as `--rd` in Sidebar.jsx. Two reasons it was handed over. It has
 * to start at *first paint* — waiting for this island to boot held the rail
 * blank for up to a second on a cold load, which is exactly the "laggy"
 * sidebar entrance — and transform/opacity keyframes run on the
 * compositor, so the boot's long task cannot stutter a frame of it. So
 * this file never touches `[data-reveal]`: no inline hidden state, no
 * entrance tween, and no adoption of the nav's CSS `translate` centring
 * into a yPercent either (keyframes animate `transform`, a different
 * property — that hack only ever existed because GSAP was writing here).
 *
 * ── Selectors ─────────────────────────────────────────────────────────────
 * REVEALS must stay in step with the `html.motion` rule in global.css,
 * which hides the identical set before first paint. Same contract for BAR:
 * `.motion .skill-fill` collapses every bar, so this file has to write that
 * state back inline before the class drops — and every bar it writes must
 * also get a trigger, or it stays empty forever. The chrome's counterpart
 * lives in the other half of that CSS rule and in Sidebar.jsx, not here.
 */

/* Entrance distance in px — deliberately small: motion here should be
   felt, not watched, so reveals rise 12px rather than a quarter-inch.
   Matches translateY(0.75rem) in global.css. */
const HIDDEN_Y = 12;

/* Main content already on screen at boot holds a beat so the rail's
   entrance — which now starts at first paint, from CSS — owns the opening
   moment on its own; the two then coexist, left column and right, instead
   of racing. Reels further down the page are unaffected: they compute
   inLoad as false and receive no delay. */
const LOAD_DELAY = 0.25;

const REVEALS = [
  { sel: "main section header", dur: 0.9 },
  { sel: "main p", dur: 0.8 },
  { sel: "main h3", dur: 0.75, delay: 0.06 },
  // Three-up grid: cascade left→right inside a row so tiles don't pop as one.
  { sel: "main .grid > a", dur: 0.85, perRow: 3, rowStagger: 0.07 },
  { sel: "main footer a, main footer button", dur: 0.6 },
];

/**
 * Parallax — a scrubbed drift across the whole travel of a section.
 *
 * Every target is an element no reveal ever touches: the `h2` *inside* the
 * revealed `header`, and the content box the revealed children live in.
 * One property, one animator — a reveal owns its element's transform, a
 * scrub owns its own, and they meet only as parent/child.
 *
 * Amplitudes are deliberately small (a fraction of the section padding), so
 * the drift never shows a seam between abutting sections.
 *
 * ── Why small screens get a cheaper set ────────────────────────────────────
 * A scrubbed tween is work GSAP does on *every* scroll frame. Phones pay for
 * that in dropped frames, and a numeric `scrub` keeps ticking for half a
 * second after the finger stops. So below `lg` there is one layer instead of
 * two and `scrub: true` (applied synchronously, no follow-up tween): one
 * transform write per section per frame, nothing left running at rest. The
 * two-layer, eased version is desktop-only (PARALLAX_DESKTOP).
 */
const PARALLAX_DESKTOP = [
  { sel: "main section header h2", y: 14 },
  { sel: "main section [data-parallax]", y: 28 },
  // The rail gets NO parallax, deliberately. It is the anchor: a nav
  // click smooth-scrolls the page, and a scrubbed drift on the left
  // column slides the identity block, the nav and the social row
  // ~10px with it — the whole sidebar "feels moving" for the length of
  // every jump. Sticky already holds it in place; depth lives in main
  // only, and the rail's stillness is what makes the scroll read as
  // *content* moving.
];

const PARALLAX_MOBILE = [{ sel: "main section [data-parallax]", y: 16 }];

/**
 * Build the scrubbed drifts for whichever set matches this breakpoint.
 * Each target measures against its own section.
 */
const buildParallax = (gsap, items, scrub) => {
  items.forEach(({ sel, y }) => {
    laidOut(gsap, sel).forEach((el) => {
      gsap.fromTo(
        el,
        { y },
        {
          y: -y,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub,
          },
        },
      );
    });
  });
};

/** Skill-bar fills. Their hidden state is scaleX(0) rather than the reveal
    pair (opacity + y) — the bar's inline width is the data and must survive
    untouched, so what animates is only the reveal. */
const BAR = ".skill-fill";

/** Only elements with a box: a `display:none` node has no trigger worth
    making, but a `position:fixed` one (the mobile tab bar) has a real rect
    and `offsetParent === null`, so a null-check on offsetParent would drop it. */
const laidOut = (gsap, sel) =>
  gsap.utils.toArray(sel).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  });

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Section paging ─────────────────────────────────────────────────────────
 *
 * The page is a sequence of sections, not a canvas. A wheel flick, a
 * finger swipe or a scroll key is read as a *command* — "take me to the
 * next stop" — and the journey there is one eased glide (0.7s,
 * power2.inOut). At rest a section always owns the screen, so you never
 * park in the whitespace between two of them, and the movement itself is
 * the transition. The alternative options were both measured and both
 * rejected: `scroll-snap-type: y mandatory` fought the gesture leaving a
 * section (full numbers in the html rule in global.css — dragged back to
 * zero, then a whole-section lurch), and plain free scroll is the
 * "normal webpage" feel with nothing to arrive at.
 *
 * ── Which screens ──────────────────────────────────────────────────────────
 * Desktop only — `lg` and up, the same line the layout switches on
 * (PAGING_MQ below). Below it the site wears its phone and tablet
 * chrome and scrolls the way every other app on those screens does:
 * natively, continuously, momentum and all. A thumb flicking through a
 * list wants the movement it always gets, and a 0.7s hop between
 * sections reads there as friction rather than as arrival — the glide
 * is what a pointer on the desktop layout was asking for. Crossing the
 * line by resizing or rotating attaches or detaches the pager live,
 * and a detach kills a glide in flight on the way out.
 *
 * ── Stops ─────────────────────────────────────────────────────────────────
 * A stop is a rest position: each section's top minus its
 * `scroll-margin-top` — the same subtraction hash navigation makes, so a
 * glide and a nav click land on the identical pixel (96px of clearance
 * under the fixed pills, 0 where the rail takes the side). A section
 * taller than one screen (experience — 2.9 of them on a phone) adds
 * stops a screenful apart so its middle is readable at rest, plus a
 * bottom-aligned tail so its end is read before moving on and nothing is
 * skipped. Home and End jump to the ends of the list; the document end
 * closes it.
 *
 * ── Contracts ─────────────────────────────────────────────────────────────
 * - Reduced motion never reaches here: the effect returns before boot,
 *   so the pager never attaches and scrolling stays native — design
 *   identical.
 * - A glide in flight swallows the next gesture (the lock), and a short
 *   cooldown after landing swallows the tail of a trackpad's momentum —
 *   one flick is exactly one glide. Wheel deltas are normalised
 *   (line/page modes scale by 16 / viewport height) and accumulated to
 *   an 80px threshold: a single mouse notch passes, a stray tick doesn't.
 * - Hash anchors stay native (`scroll-behavior: smooth` on html): a
 *   click on an in-page link kills the glide at capture time, before
 *   the browser navigates, so the fragment scroll starts smooth with no
 *   GSAP frame left to drag it back (hashchange is kept as a backstop
 *   for non-click hash writes). While GSAP drives, `scroll-behavior` is
 *   forced to `auto` — otherwise every per-frame write would start its
 *   own CSS smooth scroll — and the stylesheet's value is handed back
 *   untouched on landing.
 * - Below `lg` none of this runs: `attachPaging` is called only while
 *   PAGING_MQ matches, so phones and tablets get unmodified native
 *   scrolling — wheel, touch and keys are never intercepted.
 * - PreviewOverlay freezes `body.overflow`, which already stops the
 *   document scroll; the handlers step aside rather than fight it.
 * -------------------------------------------------------------------- */

/* Desktop-only gate, and deliberately the layout's own line: paging is
   on exactly when the rail is. A tablet portrait (768–1023) is a small
   screen — pills, tab bar, native scroll; the same tablet in landscape
   (1024) already wears the desktop chrome and glides with it. */
const PAGING_MQ = "(min-width: 1024px)";

/* One flick → one glide. */
const WHEEL_PX = 80;
const SWIPE_PX = 55;

/* The glide. Fixed duration keeps a short hop and a long haul feeling
   like the same gesture; inOut leaves and arrives softly. */
const PAGE_TIME = 0.7;
const PAGE_EASE = "power2.inOut";

/** Every rest position in document order, in px from the top. */
const pagingStops = () => {
  const vh = window.innerHeight;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  const stops = [];
  document.querySelectorAll("main section, footer").forEach((el) => {
    const r = el.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = r.top + window.scrollY - margin;
    const bottom = r.bottom + window.scrollY;
    // Clamped to the last scrollable pixel: a short footer's top sits
    // *below* it, and an unreachable stop would animate, get clamped by
    // the browser and land nowhere — leaving every flick at the end to
    // repeat a glide that goes nowhere.
    stops.push(Math.min(maxScroll, Math.max(0, Math.round(top))));
    // A tail stop only when the section genuinely overflows the screen.
    // The top stop sits `scroll-margin` above the section (the pills'
    // clearance), so an exactly-one-screen section's "tail" would be
    // exactly that clearance below it — a 96px hop on mobile that reads
    // as a flick that did nothing. `max(8, margin)` makes the rule
    // "taller than one screen, plus a hair" at every breakpoint, and the
    // tail stop itself stays bottom-aligned (no margin: at rest, the
    // section's end sits at the viewport's end).
    if (bottom - vh > top + Math.max(8, margin)) {
      // Interior stops a screenful apart, so the *middle* of a tall
      // section is readable at rest. Experience is 2.9 screens on a
      // phone: with a top stop and a tail stop only, its middle entries
      // would be legible for exactly the 0.7s the glide takes to cross
      // them and never again — unreachable at rest by flick, swipe or
      // key alike. Each stop tiles up from the top stop (pill clearance
      // included), so consecutive rests never leave a screenful unseen;
      // one landing within 60px of the tail is dropped rather than kept
      // as a hop too small to read as movement, and the tail's view
      // still overlaps it, so at most those 60px are ever seen only
      // mid-glide.
      for (let y = top + vh; y < bottom - vh - 60; y += vh)
        stops.push(Math.min(maxScroll, Math.max(0, Math.round(y))));
      stops.push(Math.min(maxScroll, Math.round(bottom - vh)));
    }
  });
  stops.push(maxScroll);
  return stops
    .sort((a, b) => a - b)
    .filter((y, i, all) => i === 0 || y - all[i - 1] > 8);
};

/** Attach wheel/touch/key paging; returns the detach function. */
const attachPaging = (gsap) => {
  let animating = false;
  let coolUntil = 0;
  let savedBehavior = null;
  let wheelAcc = 0;
  let tracking = false;
  let claimed = false;
  let startY = 0;
  let startX = 0;
  let swipeAcc = 0;

  const frozen = () => document.body.style.overflow === "hidden";

  // Back to input mode: release the lock, arm the momentum cooldown,
  // hand `scroll-behavior` back to the stylesheet exactly as it was.
  const land = () => {
    animating = false;
    coolUntil = performance.now() + 320;
    if (savedBehavior !== null) {
      document.documentElement.style.scrollBehavior = savedBehavior;
      savedBehavior = null;
    }
  };

  const glide = (y) => {
    if (animating || performance.now() < coolUntil) return;
    if (!Number.isFinite(y) || Math.abs(y - window.scrollY) < 1.5) return;
    animating = true;
    savedBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration: PAGE_TIME,
      ease: PAGE_EASE,
      onComplete: land,
    });
  };

  // dir 1 = down/forward. The target is the next stop strictly past
  // where we are (or strictly behind, going up), which reads correctly
  // both from a resting stop and from a mid-flight position; at the ends
  // there is nothing to find and the gesture simply does nothing.
  const step = (dir) => {
    const stops = pagingStops();
    const y = window.scrollY;
    const target =
      dir > 0
        ? stops.find((s) => s > y + 2)
        : stops
            .slice()
            .reverse()
            .find((s) => s < y - 2);
    if (target !== undefined) glide(target);
  };

  const onWheel = (e) => {
    if (e.ctrlKey || frozen()) return; // pinch zoom; overlay owns the page
    const dy =
      e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaMode === 2
          ? e.deltaY * window.innerHeight
          : e.deltaY;
    if (Math.abs(e.deltaX) > Math.abs(dy)) return; // horizontal intent
    if (animating) {
      e.preventDefault(); // the glide owns the scroll — don't double-drive
      wheelAcc = 0;
      return;
    }
    // Input is a command, not a canvas: no free scrub between stops.
    e.preventDefault();
    if (performance.now() < coolUntil) {
      wheelAcc = 0;
      return;
    }
    // A reversal restarts the count instead of cancelling out.
    wheelAcc = wheelAcc * dy > 0 ? wheelAcc + dy : dy;
    if (Math.abs(wheelAcc) >= WHEEL_PX) {
      wheelAcc = 0;
      step(dy > 0 ? 1 : -1);
    }
  };

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) {
      tracking = false;
      return;
    }
    tracking = true;
    claimed = false;
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    swipeAcc = 0;
  };

  const onTouchMove = (e) => {
    if (!tracking || e.touches.length !== 1 || frozen()) return;
    if (animating) {
      e.preventDefault(); // the finger must not drag against the glide
      return;
    }
    const dy = startY - e.touches[0].clientY; // finger up = positive = down
    const dx = startX - e.touches[0].clientX;
    // Once a gesture is clearly vertical it stays ours to the end —
    // releasing mid-way would otherwise leave the native scroll we
    // already blocked half-applied alongside the glide we're about to
    // start.
    if (claimed || (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.5)) {
      claimed = true;
      swipeAcc = dy;
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (tracking && claimed && Math.abs(swipeAcc) >= SWIPE_PX)
      step(swipeAcc > 0 ? 1 : -1);
    tracking = false;
    claimed = false;
    swipeAcc = 0;
  };

  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || frozen()) return;
    const ae = document.activeElement;
    const tag = ae ? ae.tagName : "";
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      (ae && ae.isContentEditable)
    )
      return;
    // Space/Enter on a link or button still means "activate" — that key
    // belongs to the browser. Arrows on a focused control are free.
    if (
      (tag === "A" || tag === "BUTTON") &&
      (e.key === " " || e.key === "Enter")
    )
      return;
    const stops = pagingStops();
    if (e.key === "Home") {
      e.preventDefault();
      glide(stops[0]);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      glide(stops[stops.length - 1]);
      return;
    }
    const dir =
      e.key === "ArrowDown" || e.key === "PageDown" || e.key === " "
        ? 1
        : e.key === "ArrowUp" || e.key === "PageUp"
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    step(dir);
  };

  // A nav click navigates the hash *before* `hashchange` fires — which
  // is too late twice over: the fragment scroll would run against the
  // glide's inline `scroll-behavior: auto` (an instant jump instead of
  // the usual smooth one), and one more GSAP frame was still due, which
  // measured as the page being dragged off its own landing (4545 → 341
  // in a single frame). So the kill happens at capture time, before the
  // browser navigates: tween gone, `scroll-behavior` back to smooth,
  // and the fragment navigation owns the movement end to end.
  const onDocClick = (e) => {
    if (!animating) return;
    if (!e.target?.closest?.('a[href^="#"]')) return;
    gsap.killTweensOf(window);
    land();
  };

  // Backstop for hash changes that aren't clicks (a script setting
  // location.hash): still kill, so two scroll writers never coexist.
  const onHashChange = () => {
    if (animating) {
      gsap.killTweensOf(window);
      land();
    }
    wheelAcc = 0;
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("keydown", onKey);
  document.addEventListener("click", onDocClick, true);
  window.addEventListener("hashchange", onHashChange);

  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onDocClick, true);
    window.removeEventListener("hashchange", onHashChange);
    if (animating) {
      gsap.killTweensOf(window);
      land();
    }
  };
};

export default function Motion() {
  useEffect(() => {
    if (prefersReduced()) return undefined;

    let ctx = null;
    let mm = null;
    let booted = false;
    let detachPaging = null;
    let pagingMQ = null;
    let onPagingMQ = null;

    // (1) We're alive — the head failsafe can stand down.
    clearTimeout(window.__motionFail);

    // One scope for the setup so its early exits still read as exits. gsap
    // is imported at the top of the file: bundled into this island's chunk
    // and fetched in the first wave, there is no post-hydration import
    // round trip gating the entrance anymore.
    (() => {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
      // The page scrolls the window now — the default scroller, so no
      // ScrollTrigger.defaults() override is needed.
      //
      // `ignoreMobileResize`: collapsing the mobile URL bar is a pure
      // height change that fires `resize` mid-scroll. Without this every
      // such change re-measures every trigger — the stutter you feel while
      // scrolling on a phone. Width changes still refresh as they should.
      ScrollTrigger.config({ ignoreMobileResize: true });

      try {
        ctx = gsap.context(() => {
          // (3) inline hidden state, matching what `html.motion` already shows.
          //     The chrome is not in this list: `.railin` both holds it
          //     hidden and animates it, on its own clock from first paint.
          const targets = REVEALS.flatMap(({ sel }) => laidOut(gsap, sel));
          // `transition: none` ships with the hidden state on purpose: a
          // class-set transition sits on the default `transition-property:
          // all` unless it names its own properties, and its delay there
          // re-delays *every* per-frame write GSAP makes — the delay
          // restarts before it can ever apply, computed values freeze at the
          // hidden state for the whole tween, and the element pops in the
          // moment GSAP stops. (The case this was written for — class-set
          // delays on the rail and the tab bar — is gone with those classes
          // and with the chrome leaving GSAP entirely; the guard stays, it
          // costs nothing, and each tween's `clearProps` hands the property
          // back at the landing anyway.)
          gsap.set(targets, { opacity: 0, y: HIDDEN_Y, transition: "none" });
          // An element may centre itself with the CSS `translate` property
          // (the desktop rail nav's -50%). GSAP zeroes individual transform
          // properties when it takes over — the -50% would vanish for the
          // whole entrance, leaving the nav half its height low, and snap
          // back the instant clearProps ran. Adopt the centre into the
          // tween instead: as yPercent it rides along with y and clearProps
          // hands it back to the stylesheet at exactly the same place.
          targets.forEach((el) => {
            const parts = getComputedStyle(el).translate.split(/\s+/);
            if (parts.length < 2) return;
            const val = parseFloat(parts[1]);
            if (!val) return;
            gsap.set(el, {
              yPercent:
                parts[1].endsWith("%") ? val : (val / el.offsetHeight) * 100,
            });
          });
          // Bars carry a *different* hidden state, and it has to land before
          // the class drops for the same reason: dropping `html.motion` with
          // only the reveal styles in hand would flash all 15 bars full.
          const fills = laidOut(gsap, BAR);
          gsap.set(fills, { scaleX: 0, transition: "none" });

          // (4a) one trigger per element — each lands exactly in place.
          // On boot, anything already in the viewport *waits* its turn:
          // the rail entrance plays first (name → subtitle → description →
          // nav), then the main content follows — one ordered sequence,
          // not two animations racing. Below the fold `inLoad` is false,
          // so scroll reveals keep their original timing untouched.
          REVEALS.forEach(({ sel, dur, delay, perRow, rowStagger }) => {
            laidOut(gsap, sel).forEach((el, i) => {
              const inLoad =
                el.getBoundingClientRect().top < window.innerHeight * 0.92;
              gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: inLoad ? Math.min(dur, 0.52) : dur,
                ease: "power3.out",
                delay:
                  (delay ?? 0) +
                  (perRow ? (i % perRow) * rowStagger : 0) +
                  (inLoad ? LOAD_DELAY + Math.min(i, 6) * 0.035 : 0),
                clearProps: "opacity,transform,transition",
                scrollTrigger: { trigger: el, start: "top 92%", once: true },
              });
            });
          });

          // (4b) parallax — scrubbed to scroll position, never triggered
          // once. Matched, not measured: the breakpoint decides how much
          // work a scroll frame costs (see PARALLAX_* above).
          mm = gsap.matchMedia();
          mm.add("(min-width: 1024px)", () =>
            buildParallax(gsap, PARALLAX_DESKTOP, 0.5),
          );
          mm.add("(max-width: 1023px)", () =>
            buildParallax(gsap, PARALLAX_MOBILE, true),
          );

          // (4c) there is no rail entrance here — it moved to CSS before
          // this boot ever runs (`.railin` in global.css), so it can start
          // at first paint and run on the compositor, immune to the
          // refresh's long task. Direction, stagger and timing all live in
          // Sidebar's `--rd` values; see "Not GSAP's" at the top of this
          // file.

          // (4d) skill bars — the fill grows to its level as the row
          // arrives. One trigger per bar on the same 92% line the reveals
          // use, so no bar ever fills off-screen at a narrow breakpoint
          // where the section runs taller than the viewport.
          //
          // The delay staggers *columns* within each group, and the count
          // comes from gridTemplateColumns rather than a hard-coded 2: it
          // reports what this breakpoint actually renders (2-up on sm+, 1-up
          // below), so a nav jump reads as a left-then-right wave on desktop
          // and a clean top-to-bottom one on a phone. Landing on #skills by
          // hash waits its turn behind the rail entrance, like everything
          // else already on screen.
          const perGroup = new Map();
          fills.forEach((el) => {
            const ul = el.closest("ul");
            const n = perGroup.get(ul) ?? 0;
            perGroup.set(ul, n + 1);
            const cols = getComputedStyle(ul).gridTemplateColumns
              .trim()
              .split(/\s+/).length;
            const inLoad =
              el.getBoundingClientRect().top < window.innerHeight * 0.92;
            gsap.to(el, {
              scaleX: 1,
              duration: 1,
              ease: "power2.out",
              delay: (n % cols) * 0.07 + (inLoad ? LOAD_DELAY : 0),
              clearProps: "transform,transition",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            });
          });

          // Hover micro-interactions belong entirely to the markup now:
          // the marker's colour/scale and the label's slide are CSS
          // transitions, so there is no second animator to fight.
        });

        ScrollTrigger.refresh();

        // (5) hand the hidden state over from CSS to GSAP. The inline
        // styles hold every reveal and bar hidden — the chrome is held by
        // `.railin`, which this drop deliberately leaves alone — so
        // removing the class changes nothing visually. And because it
        // happens only now, the refresh's reflow is finished before the
        // content's first entrance frame instead of stuttering into it.
        document.documentElement.classList.remove("motion");
        booted = true;

        // (6) section paging — after the entrance hands over, so a glide
        //     and the reveal choreography never start together. Desktop
        //     only (PAGING_MQ): below `lg` — phones and tablets — this
        //     never attaches and the page keeps native scrolling, which
        //     is also what a failed setup falls back to at every width.
        pagingMQ = window.matchMedia(PAGING_MQ);
        onPagingMQ = () => {
          if (pagingMQ.matches) {
            if (!detachPaging) detachPaging = attachPaging(gsap);
          } else if (detachPaging) {
            // The detach kills a glide in flight and hands
            // `scroll-behavior` back before it lets go.
            detachPaging();
            detachPaging = null;
          }
        };
        onPagingMQ();
        pagingMQ.addEventListener("change", onPagingMQ);
      } catch (err) {
        console.warn("[motion] setup failed, page left static", err);
        ctx?.revert();
        document.documentElement.classList.remove("motion");
      }
    })();

    return () => {
      pagingMQ?.removeEventListener("change", onPagingMQ);
      detachPaging?.();
      // Never got as far as step 5? Make sure nothing stays hidden.
      if (!booted) document.documentElement.classList.remove("motion");
      mm?.revert();
      ctx?.revert();
    };
  }, []);

  return null;
}

/* -------------------------------------------------------------------- *
 * Hover micro-interactions live in the markup (Sidebar.jsx): the marker's
 * dash growth, the index/label colours and the label's 4px slide are plain
 * CSS transitions on a uniform 300ms bezier.
 *
 * This file used to GSAP-tween the marker's width here (`mouseenter` → 28,
 * leave → 6). The markup's own `group-hover:w-7` already reaches for that
 * width, so GSAP was a second animator fighting the CSS transition —
 * double smoothing on enter, a `clearProps` snap on leave. One animator
 * per property is the rule: scroll reveals are GSAP's, hovers are the
 * stylesheet's.
 * -------------------------------------------------------------------- */
