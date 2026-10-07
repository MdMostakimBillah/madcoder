import { pad } from "../data/projects.js";
import { ArrowUpRight } from "./Icons.jsx";

/**
 * A bordered tile in the hairline grid.
 * The amber sweep uses `transform: scale()` — composited, never a
 * width/height animation, so it costs nothing to run.
 *
 * The face carries the number, the name and the way out — and looks the
 * way it always did. Overview, features, technology and use case ship
 * in a sheet below it: hovering expands the card sideways (the
 * flex-grow accordion — its neighbours give up their width) and the
 * sheet rides up inside the room that opens, over a frosted ground —
 * a thin paper veil on a real backdrop blur, so the amber sweep behind
 * blooms instead of printing through the rows. Where there is no hover
 * — touch, or a viewport too narrow to expand — the sheet sits in the
 * flow as a tinted panel with an amber tick on every label, and keeps
 * the `lede` the expanded card has no height for. Content is never
 * hidden behind an input you don't have.
 *
 * An anchor, not a button: with JavaScript off it simply takes you to
 * the live project. With JS on, the click is intercepted and the
 * on-demand preview opens instead.
 */
export default function ProjectCard({ project, onOpen }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        event.preventDefault();
        onOpen(project);
      }}
      aria-label={`Open live preview of ${project.name}`}
      className="project-card group relative flex min-h-[7rem] flex-col justify-between overflow-hidden border-r border-b border-rule bg-paper p-4 text-left no-underline transition-colors duration-300 hover:bg-paper-raised"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-amber/25 transition-transform duration-500 ease-out group-hover:scale-100"
      />

      <span className="relative z-10 flex items-start justify-between gap-3">
        <span
          data-dim
          className="type-eyebrow tabular-nums text-muted transition-colors duration-300 group-hover:text-ink"
        >
          {pad(project.id)}
        </span>
        <ArrowUpRight className="h-4 w-4 -translate-x-1 -translate-y-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-ink group-hover:opacity-100" />
      </span>

      <span className="project-face relative z-10 mt-5 block">
        <span className="block text-[1.15rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
          {project.name}
        </span>

        {project.tags.length > 0 && (
          <span className="mt-2.5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="border border-rule bg-paper/70 px-1.5 py-0.5 text-[11px] tracking-wide text-muted"
              >
                {tag}
              </span>
            ))}
          </span>
        )}

        <span
          data-dim
          className="view-live mt-3 flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-300 group-hover:text-ink"
        >
          View live
        </span>
      </span>

      {/* Overview / features / technology / use case — the accordion
          sheet. Plain label + value children: stacked like a definition
          list in the flow (touch, small screens — the lede lives here),
          inline-labelled one row per group in the expanded card, where
          the lede is dropped for height (global.css). */}
      <span className="project-details">
        {project.lede && (
          <span className="project-details__group project-details__lede">
            <span className="type-eyebrow text-muted">Overview</span>
            <span className="text-[14px] leading-[1.6] text-ink-soft">
              {project.lede}
            </span>
          </span>
        )}

        <span className="project-details__group">
          <span className="type-eyebrow text-muted">Features</span>
          <span className="text-[13px] leading-[1.5] text-ink-soft">
            {project.features.join(" · ")}
          </span>
        </span>

        <span className="project-details__group">
          <span className="type-eyebrow text-muted">Technology</span>
          <span className="project-details__chips flex flex-wrap gap-1.5">
            {project.tech.map((chip) => (
              <span
                key={chip}
                className="border border-rule bg-paper/70 px-1.5 py-0.5 text-[11px] tracking-wide text-ash"
              >
                {chip}
              </span>
            ))}
          </span>
        </span>

        <span className="project-details__group">
          <span className="type-eyebrow text-muted">Use case</span>
          <span className="text-[13px] leading-[1.5] text-ink-soft">
            {project.useCase}
          </span>
        </span>
      </span>
    </a>
  );
}
