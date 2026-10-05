import { skills } from "../data/content.js";
import Section from "./Section.jsx";

/**
 * Skills — grouped progress bars (Office / Design / Programming), the
 * reference layout: category eyebrow, then label + bar pairs two-up.
 * The bar fill is the item's `level` from the data, so tuning a skill
 * never means touching markup.
 */
export default function SkillsSection() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid gap-7">
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="type-eyebrow text-amber-deep">{group.category}</h3>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3"
                >
                  <span className="truncate text-[13px] text-ink">
                    {item.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-1.5 overflow-hidden rounded-full bg-rule"
                  >
                    <span
                      className="block h-full rounded-full bg-amber"
                      style={{ width: `${item.level}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
