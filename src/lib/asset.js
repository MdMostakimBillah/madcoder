/**
 * Resolves a file in `public/` against Astro's configured base.
 *
 * With `base: "/madcoder"`, `import.meta.env.BASE_URL` is `/madcoder` —
 * no trailing slash (Astro only appends one with `trailingSlash: "always"`).
 * Both sides are normalized so this can never emit `/madcoderimg/...`.
 */
export const asset = (path) => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const file = String(path).replace(/^\/+/, "");
  return `${base}/${file}`;
};
