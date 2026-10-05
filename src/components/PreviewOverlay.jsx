import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { pad } from "../data/projects.js";
import { ArrowUpRight, CloseIcon } from "./Icons.jsx";

/**
 * Full-screen live preview.
 *
 * The iframe only ever exists while this component is mounted, so the
 * project site is never fetched until the visitor actually asks for it —
 * and closing tears the whole document down again.
 *
 * Rendered through a portal onto <body>, not inline: at body level it is a
 * sibling of everything, so `z-50` finally means `z-50` — the rail, the
 * glass pills and the tab bar all sit below it. Locking `body` overflow
 * while it is open also freezes the document scroll (the value propagates
 * to the viewport), so the page behind can't be moved.
 */
export default function PreviewOverlay({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.focus) previouslyFocused.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  // `project` is only ever non-null after a click, so this never runs
  // during the server render — `document` is safe to touch here.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} live preview`}
      className="animate-overlay fixed inset-0 z-50 flex flex-col bg-[#0f0d0a]"
    >
      <div className="flex shrink-0 items-center gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <span className="type-eyebrow tabular-nums text-amber">{pad(project.id)}</span>

        <span className="min-w-0 flex-1 truncate text-sm font-bold tracking-tight text-white">
          {project.name}
        </span>

        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 text-[13px] text-white/55 transition-colors duration-200 hover:text-amber sm:flex"
        >
          Open in new tab
          <ArrowUpRight />
        </a>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 border border-white/20 px-3 py-1.5 text-[13px] font-bold text-white/85 transition-colors duration-200 hover:border-amber hover:text-amber focus-visible:outline-amber"
        >
          <CloseIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      <iframe
        src={project.url}
        title={`${project.name} live preview`}
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </div>,
    document.body,
  );
}
