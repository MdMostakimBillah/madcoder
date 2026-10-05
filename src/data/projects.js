/**
 * The three live project demos.
 *
 * `url` is only fetched when the visitor opens a preview — the iframe is
 * mounted on demand and torn down on close, so nothing loads up front.
 *
 * `tags` is optional: add a few short strings (e.g. ["React", "Vite"])
 * and they will render on the card.
 */
export const projects = [
  {
    id: 1,
    name: "SMS",
    url: "https://smsappbd.vercel.app",
    tags: [],
  },
  {
    id: 2,
    name: "ScholarX",
    url: "https://exam-tawny-gamma.vercel.app",
    tags: [],
  },
  {
    id: 3,
    name: "Kotha",
    url: "https://my-speach.vercel.app",
    tags: [],
  },
];

/** Zero-padded index used for the editorial numbering (01, 02, …). */
export const pad = (n) => String(n).padStart(2, "0");
