# openmoat.dev

The website for [OpenMoat](https://github.com/crocodile-labs/openmoat), by Crocodile Labs.

Static pages: the home page `index.html`, the blog under `blog/` (with `rss.xml`) and
one shared `style.css`. No framework, no build step, no tracking, no cookies, no
external scripts or fonts. GitHub Pages serves it from `main` at the repository root.

Every claim on the page comes from the OpenMoat README, `docs/EVIDENCE.md`,
`docs/THREAT_MODEL.md` and `docs/INSTALL.md`. When those change, update the page to
match.

Preview locally: `python3 -m http.server` in this directory, then open
http://localhost:8000/.

<!--
Custom domain (not active yet; the domain is not purchased):
once openmoat.dev is registered, add a file named CNAME at the repository root
containing the single line

    openmoat.dev

then point the domain's DNS at GitHub Pages and set the custom domain in
Settings > Pages.
-->
