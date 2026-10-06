import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons.jsx";

export const THEME_STORAGE_KEY = "theme";

/** Shared timer — the desktop rail and the mobile pill are two instances of
    this button, so a rapid double-toggle must disarm from one clock. */
let themeTid = 0;

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

  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");

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
