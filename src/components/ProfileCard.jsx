import { useEffect, useState } from "react";

import { asset } from "../lib/asset.js";

const TRIGGERS = ["mostakim billah", "mohammad mostakim billah"];
const PORTRAIT = asset("img/mostakim.webp");

/**
 * Easter egg carried over from the original site: selecting your name
 * reveals a small profile card. Rewritten to use `selectionchange`
 * (rAF-debounced) instead of a `mouseup` handler that called
 * `selection.toString()` twice per event.
 */
export default function ProfileCard() {
  const [card, setCard] = useState(null);

  useEffect(() => {
    let frame = 0;

    const evaluate = () => {
      frame = 0;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setCard((current) => (current ? null : current));
        return;
      }

      const text = selection.toString().trim().toLowerCase();
      if (!TRIGGERS.includes(text)) {
        setCard((current) => (current ? null : current));
        return;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const gutter = 140;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2, gutter),
        window.innerWidth - gutter
      );
      const top = Math.min(rect.bottom + 14, window.innerHeight - 268);

      setCard({ left, top: Math.max(top, 16) });
    };

    const onSelectionChange = () => {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Esc dismisses; a click elsewhere collapses the selection, which
  // fires `selectionchange` and hides the card on its own.
  useEffect(() => {
    if (!card) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setCard(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [card]);

  if (!card) return null;

  const facts = [
    ["Name", "Md Mostakim Billah"],
    ["Age", "23"],
    ["Gender", "Male"],
    ["Blood", "O- (ve)"],
  ];

  return (
    <div
      onMouseDown={(event) => event.preventDefault()}
      style={{ left: `${card.left}px`, top: `${card.top}px` }}
      className="animate-sheet card-shadow fixed z-40 w-64 -translate-x-1/2 select-none rounded-2xl border border-rule/70 bg-paper-raised/70 p-5 text-center ring-1 ring-inset ring-amber/25 backdrop-blur-xl backdrop-saturate-150 dark:border-white/12"
    >
      {/* Glass edge: light catching the top of the pane. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-px h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
      />

      <div className="mx-auto w-[84px] overflow-hidden rounded-full ring-2 ring-amber shadow-[0_10px_28px_-10px_rgb(20_17_13/0.6)]">
        <img
          src={PORTRAIT}
          width={400}
          height={489}
          alt="Portrait of Md Mostakim Billah"
          className="h-auto w-full"
          decoding="async"
        />
      </div>

      <dl className="mt-4 divide-y divide-rule/60 text-left dark:divide-white/10">
        {facts.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-3 py-1.5"
          >
            <dt className="type-eyebrow text-muted">{label}</dt>
            <dd className="text-[13.5px] font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
