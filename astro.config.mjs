// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
// GitHub Pages serves the repo under /<repo>/, so every generated asset URL
// must carry this prefix — but Vercel serves from the domain root, where the
// same prefix would 404. Vercel sets VERCEL=1 in its build environment, so
// the base flips automatically per platform: /madcoder for GitHub Pages,
// / (root) for Vercel.
const onVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  site: "https://mdmostakimbillah.github.io",
  base: onVercel ? "/" : "/madcoder",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: "es2020",
    },
  },
});
