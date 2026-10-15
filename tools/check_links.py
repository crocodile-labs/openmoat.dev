"""Check every internal link and anchor in the built site (dist/).

    python3 -I tools/check_links.py
"""
import os
import re
import sys
from html.parser import HTMLParser

root = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links = set(), []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.add(a['id'])
        for k in ('href', 'src'):
            v = a.get(k)
            if v and not v.startswith(('http', 'mailto:', 'data:', '//')):
                self.links.append(v)


pages = {}
for d, _, fs in os.walk(root):
    for f in fs:
        if f.endswith('.html'):
            p = Page()
            p.feed(open(os.path.join(d, f), encoding='utf-8').read())
            pages[os.path.relpath(os.path.join(d, f), root)] = p


def target(page, link):
    path, _, frag = link.partition('#')
    if not path:
        return page, frag
    base = path if path.startswith('/') else os.path.join('/', os.path.dirname(page), path)
    base = os.path.normpath(base).lstrip('/')
    for cand in (base, os.path.join(base, 'index.html'), base + '.html'):
        if os.path.isfile(os.path.join(root, cand)):
            return cand, frag
    return None, frag


bad = 0
for page, p in sorted(pages.items()):
    for link in p.links:
        t, frag = target(page, link)
        if t is None:
            print('%s: missing %s' % (page, link))
            bad += 1
        elif frag and t.endswith('.html') and t in pages and frag not in pages[t].ids:
            print('%s: missing anchor %s' % (page, link))
            bad += 1
print('%d pages, %d problems' % (len(pages), bad))
sys.exit(1 if bad else 0)
