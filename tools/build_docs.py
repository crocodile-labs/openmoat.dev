"""Build openmoat.dev/docs from docs-src/*.md. No dependencies.

    python3 -I tools/build_docs.py          # writes docs/*.html
    python3 -I tools/build_docs.py --check  # fails if docs/ is not up to date

Markdown subset: front matter (`key: value` between `---` lines), `##`/`###`
headings, paragraphs, `-` and `1.` lists, tables, fenced code, `inline code`,
**bold**, [links](url). Components, each closed by a line `:::`:

    :::steps            numbered steps; each `### Title` starts one
    :::note [Title]     callouts: note, tip, warning
    :::cards            a grid of `- [Title](href) description` items
    :::tabs             `@tab Name` starts each tab
    :::terminal         output as the agent or the terminal shows it
"""
import html
import os
import re
import sys

SRC = 'docs-src'
OUT = 'docs'
REPO = 'https://github.com/crocodile-labs/openmoat.dev/blob/main/docs-src/'

NAV = [
    ('Get started', ['index', 'quickstart', 'how-it-decides']),
    ('Everyday use', ['blocked', 'work-across-repos', 'allow-a-site', 'keep-tokens-safe',
                      'see-what-happened', 'check-a-command']),
    ('Set up', ['change-the-rules', 'team-rules', 'auto-approve-and-ci', 'upgrade', 'turn-off']),
    ('Help', ['troubleshooting', 'commands', 'limits']),
]


# ---------- inline ----------

def inline(text):
    codes = []

    def keep(m):
        codes.append('<code>%s</code>' % html.escape(m.group(1), quote=False))
        return '\x00%d\x00' % (len(codes) - 1)

    text = re.sub(r'`([^`]+)`', keep, text)
    text = html.escape(text, quote=False)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: '<a href="%s"%s>%s</a>' % (
        html.escape(m.group(2)), ' rel="noopener"' if m.group(2).startswith('http') else '',
        m.group(1)), text)
    return re.sub('\x00(\\d+)\x00', lambda m: codes[int(m.group(1))], text)


def slug(text):
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


# ---------- blocks ----------

class Page:
    def __init__(self):
        self.toc = []
        self.ids = set()
        self.tabs = 0

    def heading(self, level, text):
        body = inline(text)
        hid = base = slug(body) or 'section'
        n = 2
        while hid in self.ids:
            hid = '%s-%d' % (base, n)
            n += 1
        self.ids.add(hid)
        if level == 2:
            self.toc.append((hid, re.sub(r'<[^>]+>', '', body)))
        return '<h%d id="%s"><a class="anchor" href="#%s" aria-hidden="true">#</a>%s</h%d>' % (
            level, hid, hid, body, level)


def take_block(lines, i):
    """Lines of the component opened at lines[i], up to its closing `:::`."""
    depth, fence, body = 1, False, []
    i += 1
    while i < len(lines):
        line = lines[i]
        if line.startswith('```'):
            fence = not fence
        elif not fence and re.match(r'^:::\w', line):
            depth += 1
        elif not fence and line.strip() == ':::':
            depth -= 1
            if depth == 0:
                return body, i + 1
        body.append(line)
        i += 1
    raise SystemExit('unclosed ::: block')


def code_block(lang, code):
    shown = html.escape(code, quote=False)
    if lang in ('bash', 'sh', 'shell'):
        shown = re.sub(r'(^|\s)(#[^\n]*)', r'\1<span class="c">\2</span>', shown)
    return ('<div class="code"><div class="code-head"><span>%s</span>'
            '<button type="button" class="copy">Copy</button></div>'
            '<pre><code>%s</code></pre></div>' % (html.escape(lang or 'text'), shown))


def terminal(body):
    out = []
    for line in body:
        e = html.escape(line, quote=False)
        if re.match(r'^\s*(moat: deny|✗|⛔)', line):
            e = '<span class="t-deny">%s</span>' % e
        elif re.match(r'^\s*(moat: ask|\?)', line):
            e = '<span class="t-warn">%s</span>' % e
        elif re.match(r'^\s*(✔|✓)', line):
            e = '<span class="t-ok">%s</span>' % e
        elif line.startswith('$ '):
            e = '<span class="t-dim">$</span>' + e[1:]
        out.append(e)
    return '<pre class="terminal">%s</pre>' % '\n'.join(out)


def component(page, name, arg, body):
    if name in ('note', 'tip', 'warning'):
        title = arg or {'note': 'Note', 'tip': 'Tip', 'warning': 'Watch out'}[name]
        return '<div class="callout %s"><p class="callout-title">%s</p>%s</div>' % (
            name, inline(title), blocks(page, body))
    if name == 'terminal':
        return terminal(body)
    if name == 'steps':
        items, cur = [], None
        for line in body:
            if line.startswith('### '):
                cur = [line[4:], []]
                items.append(cur)
            elif cur:
                cur[1].append(line)
        return '<ol class="step-list">%s</ol>' % ''.join(
            '<li><h3>%s</h3>%s</li>' % (inline(t), blocks(page, b)) for t, b in items)
    if name == 'cards':
        cards = []
        for line in body:
            m = re.match(r'^- \[([^\]]+)\]\(([^)]+)\)\s*(.*)$', line)
            if m:
                cards.append('<a class="doc-card" href="%s"><strong>%s</strong><span>%s</span></a>' % (
                    html.escape(m.group(2)), inline(m.group(1)), inline(m.group(3))))
        return '<div class="doc-cards">%s</div>' % ''.join(cards)
    if name == 'tabs':
        tabs, cur = [], None
        for line in body:
            if line.startswith('@tab '):
                cur = [line[5:].strip(), []]
                tabs.append(cur)
            elif cur:
                cur[1].append(line)
        page.tabs += 1
        n = page.tabs
        bar = ''.join('<button type="button" role="tab" id="t%d-%d" aria-controls="p%d-%d" '
                      'aria-selected="%s"%s>%s</button>' % (
                          n, k, n, k, 'true' if k == 0 else 'false',
                          '' if k == 0 else ' tabindex="-1"', html.escape(t))
                      for k, (t, _) in enumerate(tabs))
        panels = ''.join('<div class="doc-tabpanel" role="tabpanel" id="p%d-%d" '
                         'aria-labelledby="t%d-%d">%s</div>' % (n, k, n, k, blocks(page, b))
                         for k, (_, b) in enumerate(tabs))
        return '<div class="doc-tabs"><div class="tabs" role="tablist">%s</div>%s</div>' % (bar, panels)
    raise SystemExit('unknown component ' + name)


def table(rows):
    cells = [[c.strip() for c in r.strip().strip('|').split('|')] for r in rows]
    head, body = cells[0], cells[2:]
    return ('<div class="table-wrap"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (
        ''.join('<th scope="col">%s</th>' % inline(c) for c in head),
        ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % inline(c) for c in r) for r in body)))


def blocks(page, lines):
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        m = re.match(r'^:::(\w+)\s*(.*)$', line)
        if m:
            body, i = take_block(lines, i)
            out.append(component(page, m.group(1), m.group(2).strip(), body))
            continue
        if line.startswith('```'):
            lang, code = line[3:].strip(), []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i])
                i += 1
            out.append(code_block(lang, '\n'.join(code)))
            i += 1
            continue
        m = re.match(r'^(#{2,4}) (.*)$', line)
        if m:
            out.append(page.heading(len(m.group(1)), m.group(2)))
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append(lines[i])
                i += 1
            out.append(table(rows))
            continue
        m = re.match(r'^(-|\d+\.) ', line)
        if m:
            ordered = m.group(1) != '-'
            items = []
            while i < len(lines):
                cur = lines[i]
                mm = re.match(r'^(-|\d+\.) (.*)$', cur)
                if mm and (mm.group(1) != '-') == ordered:
                    items.append(mm.group(2))
                elif cur.startswith('  ') and items:
                    items[-1] += ' ' + cur.strip()
                else:
                    break
                i += 1
            tag = 'ol' if ordered else 'ul'
            out.append('<%s>%s</%s>' % (tag, ''.join('<li>%s</li>' % inline(t) for t in items), tag))
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(
                r'^(:::|```|#{2,4} |\||- |\d+\. )', lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append('<p>%s</p>' % inline(' '.join(para)))
    return '\n'.join(out)


# ---------- pages ----------

def read(slug_):
    text = open(os.path.join(SRC, slug_ + '.md')).read()
    meta = {}
    if text.startswith('---\n'):
        head, text = text[4:].split('\n---\n', 1)
        for line in head.splitlines():
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    return meta, text.splitlines()


def href(slug_):
    return slug_ + '.html'


def render(slug_, metas, order):
    meta, lines = metas[slug_]
    page = Page()
    body = blocks(page, lines)
    section = next(s for s, pages in NAV if slug_ in pages)
    side = ''.join(
        '<p class="side-title">%s</p><ul>%s</ul>' % (s, ''.join(
            '<li><a href="%s"%s>%s</a></li>' % (
                href(p), ' aria-current="page"' if p == slug_ else '', html.escape(metas[p][0]['nav']))
            for p in pages)) for s, pages in NAV)
    toc = ''.join('<li><a href="#%s">%s</a></li>' % (h, html.escape(t)) for h, t in page.toc)
    k = order.index(slug_)
    prev_ = order[k - 1] if k > 0 else None
    next_ = order[k + 1] if k + 1 < len(order) else None
    pager = '<nav class="pager" aria-label="Previous and next">%s%s</nav>' % (
        '<a class="prev" href="%s"><span>Previous</span>%s</a>' % (href(prev_), html.escape(metas[prev_][0]['title'])) if prev_ else '<span></span>',
        '<a class="next" href="%s"><span>Next</span>%s</a>' % (href(next_), html.escape(metas[next_][0]['title'])) if next_ else '<span></span>')
    when = ('<div class="when"><strong>Read this when</strong> %s</div>' % inline(meta['when'])) if meta.get('when') else ''
    return TEMPLATE.format(
        title=html.escape(meta['title']), summary=html.escape(meta['summary'], quote=True),
        lead=inline(meta['summary']), section=html.escape(section), side=side, body=body,
        toc=('<p class="side-title">On this page</p><ul>%s</ul>' % toc) if toc else '',
        when=when, pager=pager, edit=REPO + slug_ + '.md', slug=slug_)


TEMPLATE = '''<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · OpenMoat docs</title>
<meta name="description" content="{summary}">
<meta property="og:title" content="{title} · OpenMoat docs">
<meta property="og:description" content="{summary}">
<meta property="og:image" content="https://openmoat.dev/assets/logo.png">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="../assets/logo.svg" type="image/svg+xml">
<link rel="icon" href="../assets/logo.png" type="image/png">
<link rel="stylesheet" href="../style.css">
<script>document.documentElement.className = 'js';</script>
</head>
<body class="docs">
<a class="skip" href="#main">Skip to content</a>

<header class="bar">
  <div class="wrap wide">
    <a class="brand" href="../"><img src="../assets/logo.svg" alt="" width="34" height="34"> OpenMoat <span class="ver">docs</span></a>
    <nav aria-label="Main">
      <ul>
        <li><a href="index.html" aria-current="page">Docs</a></li>
        <li><a href="quickstart.html">Install</a></li>
        <li><a href="../blog/">Blog</a></li>
        <li><a class="gh" href="https://github.com/crocodile-labs/openmoat">GitHub</a></li>
      </ul>
    </nav>
  </div>
</header>

<div class="wrap wide docs-layout">
  <nav class="docs-side" aria-label="Documentation">
    <details class="side-menu" open><summary>Menu</summary>{side}</details>
  </nav>
  <main id="main" class="docs-main">
    <p class="crumb">{section}</p>
    <h1>{title}</h1>
    <p class="doc-lead">{lead}</p>
    {when}
    <div class="doc-body">
{body}
    </div>
    {pager}
    <p class="edit"><a href="{edit}">Edit this page on GitHub</a></p>
  </main>
  <aside class="docs-toc" aria-label="On this page">{toc}</aside>
</div>

<footer class="foot">
  <div class="wrap wide">
    <p><img class="foot-logo" src="../assets/logo.svg" alt="" width="22" height="22"> OpenMoat by Crocodile Labs · open source · no tracking, no cookies</p>
    <ul>
      <li><a href="https://github.com/crocodile-labs/openmoat">GitHub</a></li>
      <li><a href="index.html">Docs</a></li>
      <li><a href="../blog/">Blog</a></li>
      <li><a href="https://github.com/crocodile-labs/openmoat/blob/main/SECURITY.md">Security</a></li>
    </ul>
  </div>
</footer>
<script src="../docs.js"></script>
</body>
</html>
'''


def main():
    order = [p for _, pages in NAV for p in pages]
    metas = {p: read(p) for p in order}
    for p in os.listdir(SRC):
        if p.endswith('.md') and p[:-3] not in order:
            raise SystemExit('%s is not in NAV' % p)
    for p, (meta, _) in metas.items():
        for key in ('title', 'nav', 'summary'):
            if key not in meta:
                raise SystemExit('%s: front matter needs %s' % (p, key))
    stale = []
    os.makedirs(OUT, exist_ok=True)
    for p in order:
        text = render(p, metas, order)
        path = os.path.join(OUT, href(p))
        old = open(path).read() if os.path.exists(path) else None
        if old != text:
            stale.append(path)
            if '--check' not in sys.argv:
                open(path, 'w').write(text)
    if '--check' in sys.argv and stale:
        raise SystemExit('out of date: ' + ', '.join(stale))
    print('%d pages, %d written' % (len(order), 0 if '--check' in sys.argv else len(stale)))


if __name__ == '__main__':
    main()
