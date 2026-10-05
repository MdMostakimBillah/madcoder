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
      */}
      <div className="mt-8 grid grid-cols-1 border-t border-l border-rule sm:grid-cols-3">
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
