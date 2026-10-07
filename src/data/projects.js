/**
 * The three live project demos.
 *
 * `url` is only fetched when the visitor opens a preview — the iframe is
 * mounted on demand and torn down on close, so nothing loads up front.
 *
 * `tags` is optional: add a few short strings (e.g. ["React", "Vite"])
 * and they will render on the card.
 *
 * `features`, `tech` and `useCase` are the accordion sheet: pointing at
 * a card expands it sideways (the accordion in ProjectsSection) and the
 * sheet rides up inside the room that opens. features joins into a
 * " · " ribbon — SMS's is one verbatim sentence — tech renders as
 * chips, use case is a sentence. Sized for the expanded card at its
 * narrowest (768px, where it owns ~60% of a 536px row): the ribbon may
 * take up to three wrap lines there, the other groups one.
 *
 * `lede` is optional and belongs to the stacked sheet only — the
 * in-flow panel touch and small screens get. The expanded desktop card
 * has no height for it (rows are capped by the row height), so CSS
 * drops it exactly there; everywhere without hover it shows in full.
 */
export const projects = [
  {
    id: 1,
    name: "SMS",
    url: "https://smsappbd.vercel.app",
    tags: [],
    lede: "Smart, secure & multilingual — everything your institution needs to manage, automate, and grow efficiently.",
    features: [
      "All-in-One School Management — Students, Teachers, Attendance, Exams, Finance, HR, Library, Transport & More",
    ],
    tech: ["React", "Vite", "Tailwind"],
    useCase: "Runs a whole school online.",
  },
  {
    id: 2,
    name: "ScholarX",
    url: "https://exam-tawny-gamma.vercel.app",
    tags: [],
    features: ["Registration", "auto results", "QR certificates"],
    tech: ["Next.js", "React", "Tailwind"],
    useCase: "Scholarship exams, end to end.",
  },
  {
    id: 3,
    name: "Kotha",
    url: "https://my-speach.vercel.app",
    tags: [],
    features: ["Islamic & creative articles", "by topic"],
    tech: ["React", "Vite"],
    useCase: "A personal Bengali magazine.",
  },
];

/** Zero-padded index used for the editorial numbering (01, 02, …). */
export const pad = (n) => String(n).padStart(2, "0");
