/**
 * Shared section shell: title only (the eyebrow line was removed).
 *
 * Sections flow in the normal document scroll and are each at least one
 * viewport tall (`min-h-dvh`), so a screenful of scrolling usually stays
 * inside one — but nothing pins them. They used to be aligned to snap
 * points (this class plus `scroll-snap-type` on `html`), and the snap
 * fought the gesture trying to leave: a 1000px wheel sweep was dragged
 * back to zero and then jumped a whole section at once. Plain free scroll
 * was no answer either — it lets a rest land in the whitespace between
 * two sections. Movement is paged now: Motion.jsx glides wheel, touch
 * and key input from stop to stop, and the html rule in global.css keeps
 * the old numbers. Mentioning the old utility by name is what keeps
 * Tailwind emitting it, so the comment spells it out the long way.
 *
 * `lg:justify-center` centres header + content as a block on big screens
 * (the view you land on after a nav click); below `lg` content stays
 * top-aligned so it reads under the glass bar and above the tab bar.
 * Sections taller than the screen (experience) grow past `min-h`,
 * leaving no free space, so centring can never clip them.
 *
 * `scroll-mt-24` keeps a hash jump from parking the title under the fixed
 * glass pills on small screens; the desktop rail has no overlays, so it
 * lands flush to the top (`lg:scroll-mt-0`).
 *
 * The section header draws no rules of its own — the hairlines live in
 * the content (project grid, timeline).
 */
export default function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="flex min-h-dvh scroll-mt-24 flex-col py-16 sm:py-20 lg:scroll-mt-0 lg:justify-center lg:py-24"
    >
      <header>
        <h2 className="type-section text-ink">{title}</h2>
      </header>

      {/* Paragraphs, cards and timeline rows reveal individually — see
          Motion.jsx, which also drifts this box for the parallax. */}
      <div className="mt-6" data-parallax>
        {children}
      </div>
    </section>
  );
}
