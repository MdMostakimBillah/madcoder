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
  // encodeURI turns spaces and other unsafe characters into percent
  // escapes while leaving the `/` separators alone, so a filename like
  // `CV/Com Oper CV.pdf` becomes `/CV/Com%20Oper%20CV.pdf`. Pass raw
  // filenames here — a path that is already encoded would be encoded
  // a second time.
  return encodeURI(`${base}/${file}`);
};
