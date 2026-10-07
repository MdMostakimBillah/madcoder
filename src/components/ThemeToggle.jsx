import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons.jsx";

export const THEME_STORAGE_KEY = "theme";

/** Shared timer — the desktop rail and the mobile pill are two instances of
    this button, so a rapid double-toggle must disarm from one clock. */
let themeTid = 0;

/** Shared latch, for the same reason: while a reveal is playing, the page is
    showing snapshots rather than the live DOM, so a second press from either
    instance is dropped instead of flipping the palette out of step with what
    is on screen. */
let vtActive = false;

/** Length of the circular reveal (ms) — one number for the animation itself,
    the `waitUntil` guard that keeps the snapshots alive for it, and the
    failsafe that releases the latch. */
const REVEAL_MS = 550;

/**
 * Light/dark switch.
 *
 * The inline script in Base.astro resolves the stored (or OS) preference and
 * sets `<html class="dark">` *before* first paint, so the page never flashes
 * the wrong scheme. This component only reads, reports and flips that class —
 * it never decides the initial theme, which keeps server and client markup
 * byte-identical during hydration.
 *
 * Both icons are always in the DOM and CSS picks the visible one, so there is
 * no icon swap to mismatch on either side.
 *
 * A MutationObserver mirrors the class into state rather than subscribing to
 * `onClick` alone, so the button stays truthful if the theme is changed
 * anywhere else (the OS preference listener, a second toggle on mobile).
 *
 * Where the View Transitions API is available, the flip runs inside
 * `document.startViewTransition()` and a `clip-path: circle()` grows out of
 * the icon itself — the reveal block in global.css owns the animation, and
 * this component only writes the circle's origin custom properties before
 * the transition starts. Everything the reveal needs is therefore in place
 * the frame the pseudo-tree appears: no `ready` handshake, no WAAPI
 * `pseudoElement` target, both of which are the parts that wobble on a
 * browser's first transition of a page. Everywhere else the
 * `.theme-transition` crossfade takes over.
 */
export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = (event) => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");

    /** One theme flip: the class, its persistence, and the browser chrome
        colour. Runs inside the view-transition callback when there is one —
        so the new snapshot is captured *after* the palette has changed — and
        immediately otherwise. */
    const apply = () => {
      root.classList.toggle("dark", next);
      setIsDark(next);

      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      } catch {
        /* private browsing — the class still flips, it just won't persist */
      }

      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", next ? "#16130f" : "#faf8f4");
    };

    // A reveal is already in flight — ignore the press. Both instances share
    // this latch, so neither can start a second transition mid-circle.
    if (vtActive) return;

    // Reduced motion gets the plain swap (the global rule collapses the
    // crossfade to a single frame); browsers without the View Transitions
    // API get the crossfade. Everyone else gets the circular reveal.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reduced) {
      // Crossfade instead of a hard cut: arm short colour transitions across
      // the document, flip the palette, then disarm once the flip has played
      // out. The class exists only for those ~360ms, so no element carries a
      // theme transition at rest — hover and reveal timings elsewhere in the
      // stylesheet are untouched (see .theme-transition in global.css).
      root.classList.add("theme-transition");
      window.clearTimeout(themeTid);
      themeTid = window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 360);

      apply();
      return;
    }

    // Origin of the circle: the icon's own centre — "the icon point" the
    // reveal grows out of. Deliberately NOT the pressed pixel: a tap can
    // land anywhere on the 36px button, and on touch the first gesture's
    // coordinates can arrive offset from the element they hit, which is
    // exactly how the circle ends up starting near-but-not-at the icon.
    // The rect is read in the same coordinate space the snapshots are
    // captured in, so the circle and the icon inside it cannot disagree —
    // and keyboard activation (Enter/Space) lands on the same point.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Farthest viewport corner from that origin: the radius the circle needs
    // to just cover the screen, so the reveal lands flush on every edge.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // The reveal's whole geometry goes up as custom properties *before* the
    // transition starts, so `::view-transition-new(root)` can be clipped to
    // the icon from its very first frame — the stylesheet and the animation
    // that grows out of it read the same three numbers.
    root.style.setProperty("--reveal-x", `${x}px`);
    root.style.setProperty("--reveal-y", `${y}px`);
    root.style.setProperty("--reveal-r", `${radius}px`);
    root.style.setProperty("--reveal-ms", `${REVEAL_MS}ms`);

    vtActive = true;
    const settle = () => {
      vtActive = false;
    };

    try {
      const transition = document.startViewTransition(apply);

      // Hold the pseudo-tree open until the circle has actually landed: the
      // animation begins when the pseudo-tree is built — i.e. when `ready`
      // settles — so the hold is anchored there, with a hard ceiling from
      // the press in case `ready` never settles at all. Registered
      // synchronously, so a late `ready` can only ever *shorten* the hold,
      // never leave the snapshots free to tear down under a running circle.
      const hold = new Promise((resolve) => {
        let settled = false;
        const done = () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        window.setTimeout(done, REVEAL_MS + 600);
        transition.ready.then(() => window.setTimeout(done, REVEAL_MS)).catch(done);
      });
      if (typeof transition.waitUntil === "function") {
        try {
          transition.waitUntil(hold);
        } catch {
          /* the engine declines to hold — its own lifetime for the
             transition runs the CSS animation out instead */
        }
      }

      // `finished` settles whether the reveal played out or was skipped, so
      // the latch can never stay stuck and block the next toggle. The timer
      // is the belt to that brace: should the promise never settle (an
      // abandoned transition on a bfcache restore, say), the next press is
      // still let through after the reveal would have ended anyway.
      transition.finished.then(settle, settle);
      window.setTimeout(settle, REVEAL_MS * 2);
    } catch {
      // `startViewTransition` refused to start: fall back to the crossfade
      // so the flip still lands smoothly rather than not at all.
      root.classList.add("theme-transition");
      window.clearTimeout(themeTid);
      themeTid = window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 360);

      apply();
      settle();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      data-iconbtn=""
      className={`flex h-9 w-9 items-center justify-center text-ink-soft transition-colors duration-200 hover:bg-ink hover:text-paper ${className}`}
    >
      <SunIcon className="hidden h-4 w-4 dark:block" />
      <MoonIcon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
