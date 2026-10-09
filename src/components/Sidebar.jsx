import { useLayoutEffect, useRef, useState } from "react";
import { CV_FILE, identity, navItems, socials } from "../data/site.js";
import { asset } from "../lib/asset.js";
import useActiveSection from "../hooks/useActiveSection.js";
import {
  BarsIcon,
  BriefcaseIcon,
  CapIcon,
  DownloadIcon,
  LayersIcon,
  UserIcon,
  socialIcons,
} from "./Icons.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import LiquidGlass from "./LiquidGlass.jsx";
import Mascot from "./Mascot.jsx";

const NAV_IDS = navItems.map((item) => item.id);
const CV_URL = asset(CV_FILE);

/** Icon per section for the mobile tab bar (ids match `navItems`). */
const NAV_ICONS = {
  about: UserIcon,
  project: LayersIcon,
  experience: BriefcaseIcon,
  education: CapIcon,
  skills: BarsIcon,
};

/**
 * Navigation chrome — one DOM, two layouts.
 *
 * Desktop (`lg+`): sticky rail on the left — name + profession + blurb,
 * nav pinned to the exact vertical centre of the 100dvh rail, social
 * links + CV download at the bottom edge.
 *
 * Small screens: the rail collapses into *two* separate glass pills
 * floating under the top edge — identity on the left, theme switch +
 * CV download on the right — both sharing the bottom tab bar's recipe
 * (rounded-full, translucent paper, backdrop blur + saturate). The page
 * scrolls underneath, so the container is `pointer-events-none` and only
 * the pills take clicks; navigation lives in the floating glass tab bar
 * pinned above the bottom edge. The two navs are display-toggled at `lg`,
 * so only ever one of them is in the accessibility tree.
 *
 * ── Entrance ──────────────────────────────────────────────────────────────
 * Every block below carries `data-reveal`, and global.css turns that into a
 * right-to-left slide (opacity 0 -> 100%, 18px) held to each element's own
 * `--rd` delay. Those numbers are the entire choreography, in spec order —
 * identity -> the nav items *one at a time* -> socials on the rail, pills ->
 * tab icons one at a time on phones — and together they land in under a
 * second. It is CSS rather than GSAP on purpose: the cascade has to start
 * at first paint (waiting for the motion island to boot left the rail blank
 * for up to a second on a cold load) and compositor-run keyframes cannot be
 * stuttered by the boot's long task. Motion.jsx never touches these
 * elements — it neither hides them nor tweens them nor cleans up after
 * them. The travelling indicators are the one exception in reverse: they
 * position themselves with their own inline transforms, so they must never
 * carry a reveal of their own.
 */
export default function Sidebar() {
  const active = useActiveSection(NAV_IDS);

  // ── The moving indicator ───────────────────────────────────────────────
  // Instead of each item fading its own dash in and out, ONE dash (the
  // rail) and ONE amber pill (the tab bar) slide between items — the same
  // line, travelling. Positions are measured against each list's own box
  // (getBoundingClientRect deltas, so nav transforms and either
  // breakpoint are accounted for) and applied as a transform:
  // composited, one style write per activation, zero per scroll frame.
  //
  // Until the first measurement lands, both lists render exactly as they
  // always did — the active item carries its own amber dash/pill — so SSR
  // and no-JS visitors see the original design with no stray line parked
  // at the top of the list. The switch happens in one commit, so there is
  // no frame where the destination is bare before the line arrives.
  const railRef = useRef(null);
  const tabRef = useRef(null);
  const [ind, setInd] = useState({
    dy: 0,
    mx: 0,
    my: 0,
    railOn: false,
    tabOn: false,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const read = (ul, side) => {
        if (!ul || ul.offsetWidth === 0) return null; // hidden at this breakpoint
        const link = ul.querySelector("a[aria-current]");
        if (!link) return null;
        const box = ul.getBoundingClientRect();
        const rect = link.getBoundingClientRect();
        return side === "rail"
          ? { dy: rect.top - box.top + rect.height / 2 - 0.5 }
          : { mx: rect.left - box.left, my: rect.top - box.top };
      };

      const rail = read(railRef.current, "rail");
      const tab = read(tabRef.current, "tab");

      setInd((prev) => {
        const next = {
          dy: rail ? rail.dy : prev.dy,
          mx: tab ? tab.mx : prev.mx,
          my: tab ? tab.my : prev.my,
          railOn: prev.railOn || !!rail,
          tabOn: prev.tabOn || !!tab,
        };
        const unchanged =
          next.dy === prev.dy &&
          next.mx === prev.mx &&
          next.my === prev.my &&
          next.railOn === prev.railOn &&
          next.tabOn === prev.tabOn;
        return unchanged ? prev : next;
      });
    };

    measure();
    // A breakpoint flip hides one list and reveals the other — remeasure
    // so the visible indicator lands on its item instead of a stale one.
    window.addEventListener("resize", measure, { passive: true });
    const wide = window.matchMedia("(min-width: 1024px)");
    wide.addEventListener("change", measure);
    return () => {
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
    };
  }, [active]);

  return (
    // Mobile: `fixed` row of two glass pills overlaying the content — the
    // backdrop-filter on each pill makes it a containing block, which is
    // why the tab bar below is a *sibling* of <aside>, not a child.
    // Desktop: in-flow sticky rail (`top-0` + `self-start`, so the 100dvh
    // box pins without stretching to the whole page) whose padding lives
    // *inside* the min-height box, otherwise the rail becomes 100dvh +
    // 7rem tall and the bottom row falls below the fold.
    <>
    <aside className="fixed inset-x-0 top-0 z-40 px-4 py-3 pointer-events-none sm:px-6 lg:sticky lg:top-0 lg:z-10 lg:block lg:self-start lg:px-0 lg:py-0 lg:pointer-events-auto">
      <div className="relative flex items-center justify-between gap-2 lg:flex-col lg:justify-start lg:gap-0 lg:min-h-dvh lg:py-14">
        {/* ── mobile, left pill: mascot + name + profession. `flex-1` so the
             card stretches to sit just beside the action pill on the right
             instead of hugging its own text. LiquidGlass swaps the old
             one-level frosted background for the layered material at
             ≤768px only — see .glass-shell in global.css.
             The mascot is drawn (and animated) rather than a photo — same
             28px slot, so the pill's layout never changes. ── */}
        <LiquidGlass
          data-reveal
          className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/50 bg-paper/70 py-1.5 pl-1.5 pr-4 shadow-[0_16px_40px_-16px_rgb(20_17_13/0.5)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 lg:hidden"
        >
          <Mascot />

          <div className="min-w-0">
            <a
              href="#about"
              className="block truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink no-underline sm:text-[19px]"
            >
              {identity.name}
            </a>
            <span className="block truncate text-[10.5px] font-bold leading-tight tracking-wide text-ink/70 sm:text-[11px]">
              {identity.role}
            </span>
          </div>
        </LiquidGlass>

        {/* ── mobile, right pill: CV download + theme switch ── */}
        <LiquidGlass
          data-reveal
          style={{ "--rd": "0.06s" }}
          className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-full border border-white/50 bg-paper/70 py-1.5 pl-2.5 pr-1.5 shadow-[0_16px_40px_-16px_rgb(20_17_13/0.5)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 lg:hidden"
        >
          <a
            href={CV_URL}
            download
            aria-label="Download CV"
            title="Download CV"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-amber hover:text-amber-ink"
          >
            <DownloadIcon />
          </a>

          <span aria-hidden="true" className="h-5 w-px bg-rule" />

          <ThemeToggle className="rounded-full" />
        </LiquidGlass>

        {/* ── top: identity (desktop rail only — mobile carries it in the
             glass pill above) ── */}
        {/* Three separate reveals so the entrance steps them in spec
            order — name 0s -> profession 0.06s -> blurb 0.12s — ahead of
            the nav's own cascade and then the main content. Layout is
            untouched: a reveal only ever animates opacity and transform,
            and unlike the GSAP era it leaves no inline styles behind to
            clear. */}
        <div className="hidden lg:block">
          <h1
            data-reveal
            className="text-[1.15rem] font-bold leading-none tracking-[-0.02em] text-ink lg:whitespace-nowrap lg:text-[2.75rem] lg:leading-[1.05]"
          >
            <a href="#about" className="inline-block lg:block">
              {identity.name}
            </a>
          </h1>
          {/* legacy rail: profession sits tight under the name, bold and
              full-strength — not muted */}
          <p
            data-reveal
            style={{ "--rd": "0.06s" }}
            className="mt-1 text-[12px] font-bold tracking-wide text-ink lg:mt-1.5 lg:text-[17px]"
          >
            {identity.role}
          </p>
          <p
            data-reveal
            style={{ "--rd": "0.12s" }}
            className="mt-4 hidden text-[15px] leading-[1.5] text-ash lg:block"
          >
            {identity.blurb}
          </p>
        </div>

        {/* ── centre: text nav — desktop only; below lg the tab bar owns
             navigation. The container reveals nothing itself: each item
             below does, one after another — that per-item delay *is* the
             staging. It keeps lg:-translate-y-1/2 for its centring, a CSS
             `translate` property the entrance's `transform` keyframes
             never touch, so nothing has to adopt it into a tween anymore. ── */}
        <nav
          aria-label="Sections"
          className="mt-2.5 hidden lg:absolute lg:block lg:left-0 lg:top-1/2 lg:mt-0 lg:w-full lg:-translate-y-1/2"
        >
          <ul ref={railRef} className="relative flex flex-wrap items-center gap-x-5 gap-y-1 lg:flex-col lg:items-start lg:gap-1">
            {/* The travelling dash: ONE line that slides from item to
                item, instead of per-item dashes cross-fading. Same 28px,
                same amber-deep, same 300ms curve — it just moves. Held
                invisible until the first measurement lands (railOn), so
                SSR/no-JS keeps the original per-item dash — and because
                that original sits on the active item's own rect, the swap
                is pixel-identical whenever hydration lands. Never carries
                a reveal: it positions itself with its own inline
                transform, which one would overwrite. */}
            <span
              aria-hidden="true"
              style={{
                transform: `translateY(${ind.dy}px)`,
                visibility: ind.railOn ? "visible" : "hidden",
              }}
              className="pointer-events-none absolute left-0 top-0 h-px w-7 bg-amber-deep transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            />
            {navItems.map((item, i) => {
              const isActive = active === item.id;
              return (
                <li
                  key={item.id}
                  data-reveal
                  style={{ "--rd": `${(0.18 + i * 0.06).toFixed(2)}s` }}
                >
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`group flex items-center gap-2.5 py-1 text-[13.5px] transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:gap-3 lg:py-1.5 lg:text-[16px] ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {/* marker: the hairline dash — muted 16px at rest,
                        grows to 28px + amber while active or hovered.
                        Once the travelling line is live the active slot
                        keeps its width (so the label stays put) but goes
                        transparent — the moving line above *is* the active
                        dash, exactly overlapping it at rest. */}
                    <span
                      aria-hidden="true"
                      className={`h-px transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isActive
                          ? ind.railOn
                            ? "w-7 bg-transparent"
                            : "w-7 bg-amber-deep"
                          : "w-4 bg-rule group-hover:w-7 group-hover:bg-ink"
                      }`}
                    />
                    {/* inline-block: transforms are ignored on inline boxes —
                        hover slides the label right; transition-all also
                        covers the 400→700 weight flip when it activates. */}
                    <span
                      className={`inline-block transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1 ${
                        isActive ? "font-bold" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── bottom: social links + CV download ── */}
        {/* lg:self-start: the column inherits `align-items: center` from
            the mobile top row, which floats this short row to the middle
            of the rail — the name, blurb and nav all sit on the left
            edge, so the icons must too. */}
        <div
          data-reveal
          style={{ "--rd": "0.5s" }}
          className="mt-auto hidden items-center gap-3 lg:flex lg:self-start"
        >
          <ul className="flex items-center gap-1">
            {socials.map((social) => {
              const Icon = socialIcons[social.icon];
              const isExternal = social.href.startsWith("http");
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                    aria-label={social.label}
                    data-iconbtn=""
                    className="icon-lift flex h-9 w-9 items-center justify-center text-ink-soft transition-colors duration-200 hover:bg-ink hover:text-paper"
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>

          <span aria-hidden="true" className="h-5 w-px bg-rule" />

          <a
            href={CV_URL}
            download
            aria-label="Download CV"
            title="Download CV"
            data-iconbtn="amber"
            className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors duration-200 hover:bg-amber hover:text-amber-ink"
          >
            <DownloadIcon />
          </a>

          <span aria-hidden="true" className="h-5 w-px bg-rule" />

          <ThemeToggle />
        </div>
      </div>
    </aside>

      {/* Mobile: floating glass tab bar — the modern-app navigation.
          `lg:hidden` keeps it out of the desktop layout, and being a
          sibling of <aside> keeps its own backdrop-filter anchored to
          the viewport rather than to a blurred ancestor. */}
      <nav
        aria-label="Sections"
        data-reveal
        style={{ "--rd": "0.14s" }}
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <LiquidGlass
          as="ul"
          ref={tabRef}
          className="relative flex items-center gap-1 rounded-full border border-white/50 bg-paper/70 p-1.5 shadow-[0_16px_40px_-16px_rgb(20_17_13/0.5)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10"
        >
          {/* The travelling pill: the active amber background slides
              between tabs instead of each tab flipping its own on — same
              44px, same colour, same 300ms curve, one element in motion.
              Invisible until measured (tabOn), so SSR/no-JS keeps the
              original per-tab pill. Pointer-transparent: taps reach the
              link layered above it. It covers the whole link: with the
              taskbar icon-only, a link *is* the 44px icon zone. Like the
              rail's dash it never carries a reveal — its inline transform
              is its position. */}
          <span
            aria-hidden="true"
            style={{
              transform: `translate(${ind.mx}px, ${ind.my}px)`,
              visibility: ind.tabOn ? "visible" : "hidden",
            }}
            className="pointer-events-none absolute left-0 top-0 h-11 w-11 rounded-full bg-amber shadow-[0_8px_20px_-8px_rgb(252_202_36/0.75)] transition-transform duration-300 ease-out"
          />
          {navItems.map((item, i) => {
            const Icon = NAV_ICONS[item.id];
            const isActive = active === item.id;
            return (
              <li
                key={item.id}
                data-reveal
                style={{ "--rd": `${(0.2 + i * 0.06).toFixed(2)}s` }}
              >
                {/* `relative` lifts the link above the travelling pill in
                    paint order; once it is live the active tab keeps only
                    its text colour — the pill carries the fill. */}
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={item.label}
                  title={item.label}
                  className={`tab-link relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out active:scale-95 ${
                    isActive
                      ? ind.tabOn
                        ? "text-amber-ink"
                        : "bg-amber text-amber-ink shadow-[0_8px_20px_-8px_rgb(252_202_36/0.75)]"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {/* Icon only: the name lives in aria-label/title, so the
                      bar stays a single 44px row of circles and the
                      travelling pill lands dead-centre with nothing to
                      clear below it. */}
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            );
          })}
        </LiquidGlass>
      </nav>
    </>
  );
}
