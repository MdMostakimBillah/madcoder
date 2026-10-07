/**
 * The three live project demos.
 *
 * `url` is only fetched when the visitor opens a preview — the iframe is
 * mounted on demand and torn down on close, so nothing loads up front.
 *
 * `tags` is optional: add a few short strings (e.g. ["React", "Vite"])
 * and they will render on the card.
 *
 * `features`, `tech` and `useCase` are the hover sheet: pointing at a
 * card expands it sideways (the accordion in ProjectsSection) and the
 * sheet rides up inside the room that opens. They are sized to one
 * wrap line per group at the narrowest expanded width (768px, where
 * the card owns ~62% of the row): features join into a " · " ribbon,
 * tech renders as chips, use case is a sentence. Grounded in what each
 * live demo actually ships.
 */
export const projects = [
  {
    id: 1,
    name: "SMS",
    url: "https://smsappbd.vercel.app",
    tags: [],
    features: ["Records", "automatic grading", "online fees"],
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
