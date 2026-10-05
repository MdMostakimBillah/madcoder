// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://mdmostakimbillah.github.io",
  // GitHub Pages serves the repo under /<repo>/, so every generated asset
  // URL must carry this prefix. A custom domain would need this set to "/".
  base: "/madcoder",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: "es2020",
    },
  },
});
