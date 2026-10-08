// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { pwa } from "./src/pwa.mjs";

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
  // pwa() runs last so its build:done hook can scan the finished dist
  // and emit an exact-precaching service worker (see src/pwa.mjs).
  integrations: [react(), pwa()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: "es2020",
    },
  },
});
