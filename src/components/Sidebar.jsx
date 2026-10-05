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
 */
export default function Sidebar() {
  const active = useActiveSection(NAV_IDS);

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
        {/* ── mobile, left pill: logo + name + profession. `flex-1` so the
             card stretches to sit just beside the action pill on the right
             instead of hugging its own text. ── */}
        <div
          data-reveal
          className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/50 bg-paper/70 py-1.5 pl-1.5 pr-4 shadow-[0_16px_40px_-16px_rgb(20_17_13/0.5)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 lg:hidden"
        >
          <img
            src={asset("img/mostakim.webp")}
            alt=""
            width="28"
            height="28"
            aria-hidden="true"
            className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-ink/10"
          />

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
        </div>

        {/* ── mobile, right pill: CV download + theme switch ── */}
        <div
          data-reveal
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
        </div>

        {/* ── top: identity (desktop rail only — mobile carries it in the
             glass pill above) ── */}
        <div data-reveal className="hidden lg:block">
          <h1 className="text-[1.15rem] font-bold leading-none tracking-[-0.02em] text-ink lg:whitespace-nowrap lg:text-[2.75rem] lg:leading-[1.05]">
            <a href="#about" className="inline-block lg:block">
              {identity.name}
            </a>
          </h1>
          {/* legacy rail: profession sits tight under the name, bold and
              full-strength — not muted */}
          <p className="mt-1 text-[12px] font-bold tracking-wide text-ink lg:mt-1.5 lg:text-[17px]">
            {identity.role}
          </p>
          <p className="mt-4 hidden text-[15px] leading-[1.5] text-ash lg:block">
            {identity.blurb}
          </p>
        </div>

        {/* ── centre: text nav — desktop only; below lg the tab bar owns navigation ── */}
        <nav
          aria-label="Sections"
          data-reveal
          className="mt-2.5 hidden delay-100 lg:absolute lg:block lg:left-0 lg:top-1/2 lg:mt-0 lg:w-full lg:-translate-y-1/2"
        >
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 lg:flex-col lg:items-start lg:gap-1">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`group flex items-center gap-2.5 py-1 text-[13.5px] transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:gap-3 lg:py-1.5 lg:text-[16px] ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {/* marker: the hairline dash — muted 16px at rest,
                        grows to 28px + amber while active or hovered.
                        transition-all eases width AND colour together on
                        the same 300ms curve (CSS is its only animator —
                        the old GSAP width tween fought it). */}
                    <span
                      aria-hidden="true"
                      className={`h-px transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isActive
                          ? "w-7 bg-amber-deep"
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
        <div data-reveal className="mt-auto hidden items-center gap-3 lg:flex">
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
                    className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors duration-200 hover:bg-ink hover:text-paper"
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
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] delay-300 lg:hidden"
      >
        <ul className="flex items-center gap-1 rounded-full border border-white/50 bg-paper/70 p-1.5 shadow-[0_16px_40px_-16px_rgb(20_17_13/0.5)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10">
          {navItems.map((item) => {
            const Icon = NAV_ICONS[item.id];
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={item.label}
                  title={item.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out active:scale-95 ${
                    isActive
                      ? "bg-amber text-amber-ink shadow-[0_8px_20px_-8px_rgb(252_202_36/0.75)]"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
