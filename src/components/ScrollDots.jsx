import { navItems } from "../data/site.js";
import useActiveSection from "../hooks/useActiveSection.js";

const NAV_IDS = navItems.map((item) => item.id);

/**
 * Scroll dots — the position indicator that replaced the scrollbar.
 *
 * The document still scrolls every way it ever did (wheel, touch,
 * trackpad, keys, drag) but paints no track: these five dots occupy the
 * right edge where the thumb used to be, and lighting one answers the
 * question a progress bar never could — *which section am I in*.
 *
 * The lit dot comes from the same `useActiveSection` observer the rail
 * nav and the bottom tab bar use, so all three move together off one
 * IntersectionObserver and no second scroll listener.
 *
 * Real anchors, not buttons: they work before hydration and with JS off,
 * and the document's `scroll-behavior: smooth` does the travelling.
 *
 * The box never resizes — each link is a fixed 20px hit target and only
 * the inner span scales — so lighting a dot cannot nudge its
 * neighbours, which is also why the growth reads as the dot itself and
 * not as the row reflowing. `pointer-events-none` sits on the column and
 * `auto` on the links: the 20px strip at the page edge stays clickable
 * through, everything else stays transparent to taps.
 */
export default function ScrollDots() {
  const active = useActiveSection(NAV_IDS);

  return (
    <nav
      aria-label="Section dots"
      className="pointer-events-none fixed right-0 top-1/2 z-30 -translate-y-1/2"
    >
      <ul className="flex flex-col items-center gap-2.5 pr-0.5">
        {navItems.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "true" : undefined}
                aria-label={item.label}
                title={item.label}
                className="group pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 w-1.5 rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    on
                      ? "scale-[1.6] bg-amber-deep"
                      : "bg-ink/25 group-hover:scale-125 group-hover:bg-ink/60"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
