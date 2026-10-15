# openmoat.dev

The website for [OpenMoat](https://github.com/crocodile-labs/openmoat), by Crocodile Labs:
the home page and the docs, built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build), served by GitHub Pages from the
`deploy` workflow. No tracking, no cookies, no external fonts or scripts: the fonts
(Geist) are bundled, and search (Pagefind) runs in the browser.

| Path | What |
|---|---|
| `src/pages/index.astro` | the home page |
| `src/content/blog/*.md` | blog posts (front matter: title, description, summary, date, author, tag, minutes, optional notice); listed at `/blog/`, each at `/blog/<file name>/`, feed at `/blog/rss.xml` |
| `src/components/SiteHeader.astro`, `SiteFooter.astro`, `ThemeInit.astro`, `src/styles/site.css`, `src/layouts/Page.astro` | the header, footer, theme (dark default, light, one stored choice shared with the docs) of the home page and the blog |
| `src/content/docs/docs/*.mdx` | the docs, served at `/docs/…`; the sidebar order is in `astro.config.mjs` |
| `src/components/Impact.astro` | the "what this opens / stays protected / think about" box |
| `src/styles/docs.css` | the docs theme |
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
