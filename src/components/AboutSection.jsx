import RichText from "./RichText.jsx";
import Section from "./Section.jsx";
import { aboutParagraphs } from "../data/content.js";

/**
 * The Introduction block. Rendered to static HTML at build time —
 * no client JavaScript, the copy is in the page source.
 */
export default function AboutSection() {
  return (
    <Section id="about" title="About">
      <div className="space-y-4">
        {aboutParagraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="text-[16.5px] leading-[1.68] text-justify text-ink-soft"
          >
            <RichText text={paragraph} />
          </p>
        ))}
      </div>
    </Section>
  );
}
