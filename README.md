# openmoat.dev

The website for [OpenMoat](https://github.com/crocodile-labs/openmoat), by Crocodile Labs:
the home page and the docs, built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build), served by GitHub Pages from the
`deploy` workflow. No tracking, no cookies, no external fonts or scripts: the fonts
(Geist) are bundled, and search (Pagefind) runs in the browser.

| Path | What |
|---|---|
| `src/pages/index.astro` | the home page; its scenes and the "sneak past" results are `src/data/scenes.ts`, which names where each OpenMoat line comes from |
| `src/pages/get-started.astro`, `src/pages/where-to-use-it.astro` | Get started (install by OS, `openmoat init`) and Where to use it (its situations and marks: `src/data/situations.ts`) |
| `src/content/blog/*.md` | blog posts (front matter: title, description, summary, date, author, tag, minutes, optional notice); listed at `/blog/`, each at `/blog/<file name>/`, feed at `/blog/rss.xml` |
| `src/components/SiteHeader.astro`, `SiteFooter.astro`, `MoatMark.astro`, `ThemeInit.astro`, `src/styles/site.css`, `src/layouts/Page.astro` | the header, footer, Moat's mark and the warm light look of every page outside the docs |
| `src/content/docs/docs/*.mdx` | the docs, served at `/docs/…`; the sidebar groups are in `astro.config.mjs` |
| `src/components/FeatureTop.astro` | the block at the top of every feature page: what it does, when you need it, try it (real output), change it, limits, related |
| `src/data/features.ts`, `src/components/SupportedFeatures.astro` | the Supported features page's tables, each cell with its source |
| `src/components/Impact.astro` | the "what this opens / stays protected / think about" box |
| `src/styles/docs.css` | the docs theme (light by default, a warm dark theme on request) |
| `public/` | copied as is: the logo, `CNAME`, and a forward from the old post address (`/blog/introducing-openmoat.html`) |

```bash
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run build   # writes dist/
npx astro preview                          # http://localhost:4321/
python3 -I tools/check_links.py            # every internal link and anchor in dist/
```

Every claim on the site comes from the OpenMoat README and docs (`docs/USAGE.md`,
`docs/INSTALL.md`, `docs/SANDBOX.md`, `docs/THREAT_MODEL.md`, `docs/EVIDENCE.md`). When
they change, update the site to match, and check example verdicts against the
policy before publishing.
