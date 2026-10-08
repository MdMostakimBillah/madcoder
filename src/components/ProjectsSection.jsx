import { useCallback, useState } from "react";

import PreviewOverlay from "./PreviewOverlay.jsx";
import ProjectCard from "./ProjectCard.jsx";
import Section from "./Section.jsx";
import { projectsIntro } from "../data/content.js";
import { projects } from "../data/projects.js";

/**
 * The Selected work block — the one part of the page that owns state,
 * so it hydrates as an island. The grid itself is server-rendered into
 * the page source; only the overlay behaviour needs JavaScript.
 */
export default function ProjectsSection() {
  const [activeProject, setActiveProject] = useState(null);
  const closePreview = useCallback(() => setActiveProject(null), []);

  return (
    <Section id="project" title="Project">
      <p className="text-[16.5px] leading-[1.68] text-justify text-ink-soft">
        {projectsIntro}
      </p>

      {/*
        Hairlines are drawn by each card (border-r/border-b) with
        the container only supplying the top and left edge. That
        way an incomplete final row shows paper, not the rule
        colour — the old `gap-px` + container-background trick
        left a dead grey block in the empty cells.
        A wrapping row, but not via a breakpoint: how much of it a
        card takes lives in the same media query as the accordion
        (global.css, .project-grid). Half a line each — two tiles
        across on a phone, and with three projects the odd one out
        stretches to hold a line of its own — while the mode that
        can shrink a card again (hover + room) puts all three on one
        line and opens the sheet.
      */}
      <div className="project-grid mt-8 flex flex-wrap border-t border-l border-rule">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={setActiveProject}
          />
        ))}
      </div>

      <PreviewOverlay project={activeProject} onClose={closePreview} />
    </Section>
  );
}
