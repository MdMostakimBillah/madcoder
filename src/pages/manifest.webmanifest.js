/**
 * Web app manifest, emitted at build time as `/manifest.webmanifest`.
 *
 * Every URL is derived from `import.meta.env.BASE_URL`, so the same file
 * is correct on both platforms: `/madcoder/…` under GitHub Pages, `/…`
 * on Vercel. Served as a real endpoint (not a static file in `public/`)
 * precisely because a static file can't see the configured base.
 */
import { asset } from "../lib/asset.js";
import { siteDescription } from "../data/site.js";

const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function GET() {
  const manifest = {
    id: `${base}/`,
    // The installed app's name — launcher label and window chrome.
    // The role suffix stays in <title> for browser tabs; the panel
    // above an installed window must show the name alone.
    name: "Md Mostakim Billah",
    short_name: "Mostakim",
    description: siteDescription,
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#faf8f4",
    theme_color: "#faf8f4",
    lang: "en",
    // All derived from img/icon.png — its own framing for the any
    // variants, re-centred on a full-bleed white ground where a
    // platform masks the shape (maskable, iOS touch icon).
    icons: [
      { src: asset("icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: asset("icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: asset("icons/maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json;charset=utf-8" },
  });
}
