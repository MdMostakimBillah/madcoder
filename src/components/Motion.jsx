import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Motion layer — GSAP owns scroll reveals and the hover micro-interactions.
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
 *   2. register gsap + ScrollTrigger (bundled — no second fetch)
 *   3. write the same hidden state as inline styles
 *   4. create the ScrollTriggers and run the one-time refresh
 *   5. drop `html.motion` — last: the inline styles now hold the elements
 *      hidden, so removing the class changes nothing visually, and the
 *      refresh's reflow (setup's one long task) lands behind the gate
 *      instead of inside the entrance, where it used to stall the first
 *      frames for a sixth of a second while the nav items arrived.
 *
 * Step 5 has to follow step 3: the other way round un-hides every element
 * whose trigger hasn't fired yet. Elements GSAP skips (anything hidden at
 * this breakpoint, e.g. the desktop-only rail block) rely on that — they lose
 * the prime class with no inline styles, so they come back natural rather than
 * stuck invisible when the viewport changes.
 *
 * Every reveal ends with `clearProps`, which strips GSAP's inline styles so
 * the element settles on its exact layout position — no residual transform,
 * no sticky opacity.
 *
 * Reduced-motion visitors never get `html.motion`, so this returns before
 * touching anything and the CSS hover rules in the markup carry on alone.
 *
 * ── Selectors ─────────────────────────────────────────────────────────────
 * REVEALS must stay in step with the `html.motion` rule in global.css,
 * which hides the identical set before first paint. Same contract for BAR:
 * `.motion .skill-fill` collapses every bar, so this file has to write that
 * state back inline before the class drops — and every bar it writes must
 * also get a trigger, or it stays empty forever.
 */

/* Entrance distance in px — deliberately small: motion here should be
   felt, not watched, so reveals rise 12px rather than a quarter-inch.
   Matches translateY(0.75rem) in global.css. */
const HIDDEN_Y = 12;

/* Elements already on screen at boot hold for the rail entrance — name,
   subtitle, description, nav — before they start, so the page loads as
   one choreographed sequence in spec order rather than two animations
   racing each other. Reels further down the page are unaffected: they
   compute inLoad as false and receive no delay. */
const LOAD_DELAY = 0.25;

const REVEALS = [
  { sel: "main section header", dur: 0.9 },
  { sel: "main p", dur: 0.8 },
  { sel: "main h3", dur: 0.75, delay: 0.06 },
  // Three-up grid: cascade left→right inside a row so tiles don't pop as one.
  { sel: "main .grid > a", dur: 0.85, perRow: 3, rowStagger: 0.07 },
  { sel: "main footer a", dur: 0.6 },
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

/** Rail chrome reveals on load rather than on scroll — it's always on screen.
    Unscoped on purpose: the mobile tab bar is a *sibling* of <aside>, not a
    descendant, so `aside [data-reveal]` would miss it. */
const RAIL = "[data-reveal]";

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

export default function Motion() {
  useEffect(() => {
    if (prefersReduced()) return undefined;

    let ctx = null;
    let mm = null;
    let booted = false;

    // (1) We're alive — the head failsafe can stand down.
    clearTimeout(window.__motionFail);

    // One scope for the setup so its early exits still read as exits. gsap
    // is imported at the top of the file: bundled into this island's chunk
    // and fetched in the first wave, there is no post-hydration import
    // round trip gating the entrance anymore.
    (() => {
      gsap.registerPlugin(ScrollTrigger);
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
          // (3) inline hidden state, matching what `html.motion` already shows
          const targets = [
            ...laidOut(gsap, RAIL),
            ...REVEALS.flatMap(({ sel }) => laidOut(gsap, sel)),
          ];
          // `transition: none` ships with the hidden state on purpose: a
          // class-set `transition-delay` (the rail nav's `delay-100`, the
          // tab bar's `delay-300`) sits on the default `transition-property:
          // all`, so it re-delays *every* per-frame write GSAP makes — the
          // delay restarts before it can ever apply, computed values freeze
          // at the hidden state for the whole tween, and the element pops in
          // the moment GSAP stops. Each tween's `clearProps` hands the
          // property back at the landing, class-driven delays and all.
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

          // (4c) rail entrance — the load choreography itself. DOM order
          // in the rail *is* the spec order: name, subtitle, description,
          // nav (the mobile pills and tab bar filter in at whichever
          // breakpoint is live). A tight 60ms stagger over a 450ms fade:
          // everything has landed by ~740ms, main content trailing just
          // behind it — present, never competing.
          const rail = laidOut(gsap, RAIL);
          gsap.to(rail, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            delay: 0.05,
            ease: "power3.out",
            clearProps: "opacity,transform,transition",
          });

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
        // styles hold every element (bars included) hidden, so dropping
        // the class changes nothing visually — and because it happens
        // only now, the refresh's reflow is finished before the first
        // entrance frame instead of stuttering into it.
        document.documentElement.classList.remove("motion");
        booted = true;
      } catch (err) {
        console.warn("[motion] setup failed, page left static", err);
        ctx?.revert();
        document.documentElement.classList.remove("motion");
      }
    })();

    return () => {
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
