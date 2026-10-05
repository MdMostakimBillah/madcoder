import ExperienceList from "./ExperienceList.jsx";
import Section from "./Section.jsx";
import { experience } from "../data/content.js";

/**
 * The Experiences block. Static HTML at build time.
 */
export default function ExperienceSection() {
  return (
    <Section id="experience" title="Experiences">
      <ExperienceList items={experience} />
    </Section>
  );
}
