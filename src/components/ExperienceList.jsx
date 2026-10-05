import RichText from "./RichText.jsx";

/** Two-column timeline with hairline dividers. */
export default function ExperienceList({ items }) {
  return (
    <ul className="@container timeline border-t border-rule">
      {items.map((item) => (
        <li
          key={item.role}
          className="grid gap-2 border-b border-rule py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]"
        >
          <div className="pt-1">
            <span className="type-eyebrow tabular-nums text-amber-deep">
              {item.period}
            </span>
          </div>

          <div>
            <h3 className="text-[1.15rem] font-bold leading-tight tracking-[-0.01em] text-ink">
              {item.role}
            </h3>
            <p className="mt-2 text-[15.5px] leading-[1.65] text-justify text-ink-soft">
              <RichText text={item.body} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
