/**
 * Shared section shell: title only (the eyebrow line was removed).
 *
 * Sections flow in the normal document scroll but are each at least one
 * viewport tall (`min-h-dvh`) and snap-aligned (`snap-start` pairs with
 * `scroll-snap-type` on `html`), so exactly one section fills the screen —
 * the next section's header can never peek in from below. `lg:justify-center`
 * centres header + content as a block on big screens (the view you land on
 * after a nav click); below `lg` content stays top-aligned so it reads under
 * the glass bar and above the tab bar. Sections taller than the screen
 * (experience) grow past `min-h`, leaving no free space, so centring can
 * never clip them.
 *
 * `scroll-mt-24` keeps a hash jump from parking the title under the fixed
 * glass pills on small screens; the desktop rail has no overlays, so it
 * snaps flush to the top (`lg:scroll-mt-0`).
 *
 * The section header draws no rules of its own — the hairlines live in
 * the content (project grid, timeline).
 */
export default function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="flex min-h-dvh scroll-mt-24 snap-start flex-col py-16 sm:py-20 lg:scroll-mt-0 lg:justify-center lg:py-24"
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
