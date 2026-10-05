import Section from "./Section.jsx";
import { education } from "../data/content.js";

/**
 * The Education block — same two-column hairline list as the experience
 * timeline (ordinal + year in the left column, credential and its
 * label/value facts on the right). Static HTML at build time.
 */
export default function EducationSection() {
  return (
    <Section id="education" title="Education">
      <ul className="@container timeline border-t border-rule">
        {education.map((entry) => (
          <li
            key={entry.title}
            className="grid gap-2 border-b border-rule py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]"
          >
            <div className="pt-1">
              <span className="type-eyebrow tabular-nums text-amber-deep">
                {entry.year}
              </span>
            </div>

            <div>
              <h3 className="text-[1.15rem] font-bold leading-tight tracking-[-0.01em] text-ink">
                {entry.title}
              </h3>

              <dl className="mt-2 space-y-1">
                {entry.facts.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap items-baseline gap-x-2.5 text-[15px]"
                  >
                    <dt className="type-eyebrow text-muted">{label}</dt>
                    <dd className="text-ink-soft">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
