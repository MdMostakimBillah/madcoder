# Md Mostakim Billah — Portfolio

A minimal, editorial portfolio site built with **Astro 7 + React 19 islands + Tailwind CSS 4**.
Everything except four interactive components is rendered to static HTML at build
time — no client-side rendering of content, no state library, no data fetching.
The whole site ships as ~89 KB gzipped and the full copy is in the page source.

## Quick start

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Architecture

The page is composed in `src/pages/index.astro`. Components used there **without**
a `client:` directive are server-rendered to plain HTML and ship zero JavaScript.
Only four things hydrate on the client, each as an island (`client:load`):

| Island | Why it needs JavaScript |
|---|---|
| `Sidebar` | scroll-spy (`IntersectionObserver` nav highlighting) |
| `ProjectsSection` | owns the preview overlay state |
| `Glow` | cursor-following glow |
| `ProfileCard` | "select your name" easter egg |

Islands are still server-rendered into the HTML first, so the project grid is in
the page source even though it hydrates.

The document scrolls normally: `html` is the scroller and each section is
exactly as tall as its content (`Section.jsx` — normal padding, no
full-height screen, no scroll-snap), so nav links and deep links like
`/#experience` smooth-scroll the page itself. On top of the one-shot
entrance reveals, GSAP scrubs a small parallax drift through each section
(title and content box move at slightly different rates) — see
`Motion.jsx`. Prose is set justified.

## Project structure

```
astro.config.mjs           site, base: "/madcoder", React + Tailwind integrations
src/
  layouts/Base.astro       <head> (meta, SEO/OG, JSON-LD, font preloads), global CSS
  pages/index.astro        page composition — shell + islands + static sections
  styles/global.css        Tailwind `@theme` tokens, @font-face, type scale
  data/
    site.js                identity, nav, social links
    projects.js            the 10 live project URLs
    content.js             About / Project / Experience copy
  components/
    AboutSection.jsx       Introduction block — static, no JS
    ExperienceSection.jsx  Experiences block — static, no JS
    ProjectsSection.jsx    Selected work island (state + overlay)
    Footer.jsx             footer — static, year refreshed by inline script
    Sidebar.jsx            sticky rail (desktop) / sticky bar (mobile) — island
    Section.jsx            numbered eyebrow + hairline rule shell
    ProjectCard.jsx        grid tile, link to the live project (JS opens preview)
    ExperienceList.jsx     two-column timeline
    PreviewOverlay.jsx     on-demand iframe dialog
    ProfileCard.jsx        "select your name" easter egg — island
    Glow.jsx               cursor glow, GPU-composited — island
    Icons.jsx              inline SVGs (replaces Font Awesome)
    RichText.jsx           renders `**bold**` markers
  hooks/useActiveSection.js  IntersectionObserver nav highlighting
  lib/asset.js             base-aware paths for files in public/
```

## Performance notes

| Was | Now |
|---|---|
| 10 iframes fetched on page load | **0 iframes** — `src` set only when a preview opens, torn down on close |
| 1.46 MB profile PNG | **15 KB** WebP, 400×489 |
| 1.66 MB of TTF fonts (+314 KB unused) | **48 KB** WOFF2, subset to Latin, `font-display: swap` |
| Font Awesome CDN CSS + webfont for 7 icons | **inline SVGs**, zero requests |
| `filter: blur(250px)` animated via `left`/`top` | radial gradient moved with `translate3d` only — no layout, no paint |
| Hover circle animated via `width`/`height` | `transform: scale()` |

## Rendering

Content, projects and experience are **server-rendered into `dist/index.html`** —
crawlers and no-JS visitors get the full page. JavaScript loads only for the four
islands, and the initial paint doesn't wait for it.

Project cards are real links: with JavaScript off they open the live project
directly; with JavaScript on the click opens the on-demand preview overlay.

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

The site is served from a sub-path, so `astro.config.mjs` sets `base: "/madcoder"`.
Every generated asset URL (and `src/lib/asset.js`) carries that prefix. **If you ever
move to a custom domain at the root, change `base` to `"/"`** — the old relative-base
trick from the Vite version is not supported by Astro.

## Editing content

- Change copy in `src/data/content.js`
- Add/remove projects in `src/data/projects.js` (add `tags: ["React", "Vite"]` to show tech chips)
- Update social URLs in `src/data/site.js`
- Palette and type scale live in the `@theme` block at the top of `src/styles/global.css`
