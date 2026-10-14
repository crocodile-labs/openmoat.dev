# openmoat.dev

The website for [OpenMoat](https://github.com/crocodile-labs/openmoat), by Crocodile Labs.

Static pages: the home page `index.html`, the blog under `blog/` (with `rss.xml`) and
one shared `style.css` with light and dark themes. No framework, no build step, no
tracking, no cookies, no external scripts or fonts. GitHub Pages serves it from `main`
at the repository root, on the custom domain in `CNAME`.

Every claim on the page comes from the OpenMoat README, `docs/USAGE.md`,
`docs/EVIDENCE.md`, `docs/THREAT_MODEL.md` and `docs/INSTALL.md`. When those change,
update the page to match. `assets/demo.gif` is a copy of `docs/assets/demo.gif`.

Preview locally: `python3 -m http.server` in this directory, then open
http://localhost:8000/.
