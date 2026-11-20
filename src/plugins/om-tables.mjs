// Every markdown table in the docs, designed in one place (styles: src/styles/docs.css).
//   - each table is wrapped in a rounded container that scrolls sideways when it must;
//   - every cell gets data-label (its column's header), so a table of up to four columns
//     turns into one card per row on a narrow screen (class om-stack);
//   - a cell that is exactly a verdict (allow, defer, review, deny, also as `code`) shows
//     as a coloured chip, with the word still in the text;
//   - a table with one agent per row (its first header is "Agent", or most first cells
//     name a supported agent) becomes agent tiles (class om-agents): the agent's mark from
//     src/data/logos.ts, its name, then the row's facts as labelled lines.
// No new dependencies: a hast plugin for Sätteri, the Markdown processor Astro ships.

const VERDICTS = new Set(['allow', 'defer', 'review', 'deny', 'ask']);

const text = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(text).join('');
const isEl = (node, tag) => node && node.type === 'element' && (!tag || node.tagName === tag);
const kids = (node, tag) => (node.children || []).filter((c) => isEl(c, tag));
const addClass = (node, ...names) => {
  node.properties = node.properties || {};
  const cur = node.properties.className || [];
  node.properties.className = [...(Array.isArray(cur) ? cur : [cur]), ...names];
};

export default function omTables({ logos = [] } = {}) {
  // longest names first, so "GitHub Copilot CLI" wins over a shorter name inside it
  const marks = [...logos].sort((a, b) => b.name.length - a.name.length);
  const findAgent = (s) => {
    const t = s.replace(/\s+/g, ' ').trim();
    if (!t || t.length > 60) return null;
    return marks.find((l) => t === l.name || t.startsWith(`${l.name} `) || t.startsWith(`the ${l.name}`) || t.startsWith(`${l.name} (`)) || null;
  };
  const mark = (logo) => {
    const span = { type: 'element', tagName: 'span', properties: { className: ['om-mark'], ariaHidden: 'true' }, children: [] };
    if (logo.path) {
      span.children.push({
        type: 'element', tagName: 'svg', properties: { viewBox: '0 0 24 24', width: 18, height: 18, focusable: 'false' },
        children: [{ type: 'element', tagName: 'path', properties: { fill: 'currentColor', d: logo.path }, children: [] }],
      });
    } else {
      span.children.push({ type: 'text', value: logo.glyph || logo.name.charAt(0) });
    }
    return span;
  };

  const table = (node) => {
    const thead = kids(node, 'thead')[0];
    const tbody = kids(node, 'tbody')[0];
    if (!thead || !tbody) return null;
    const heads = kids(kids(thead, 'tr')[0] || { children: [] }).map((th) => text(th).trim());
    const rows = kids(tbody, 'tr');
    for (const tr of rows) {
      kids(tr).forEach((cell, i) => {
        cell.properties = cell.properties || {};
        if (heads[i]) cell.properties.dataLabel = heads[i];
        const word = text(cell).trim().toLowerCase();
        if (VERDICTS.has(word)) {
          cell.children = [{ type: 'element', tagName: 'span', properties: { className: ['om-v', `om-v-${word === 'ask' ? 'review' : word}`] }, children: [{ type: 'text', value: word }] }];
        }
      });
    }
    const firstCells = rows.map((tr) => kids(tr)[0]).filter(Boolean);
    const named = firstCells.map((c) => findAgent(text(c)));
    const agentTable = rows.length >= 2 && (/^(agent|host)$/i.test(heads[0] || '') || named.filter(Boolean).length >= Math.max(2, Math.ceil(rows.length * 0.6)));
    if (agentTable) {
      addClass(node, 'om-agents');
      firstCells.forEach((cell, i) => { if (named[i]) cell.children.unshift(mark(named[i])); });
    } else if (heads.length > 0 && heads.length <= 4) {
      addClass(node, 'om-stack');
    }
    return { type: 'element', tagName: 'div', properties: { className: ['om-table'] }, children: [node] };
  };

  // A plain copy of the node: Sätteri's nodes carry internal fields (_id, _resolver).
  const plain = (node) => {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_')) continue;
      out[k] = k === 'children' ? v.map(plain) : v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
    }
    return out;
  };
  // A Sätteri hast plugin (Astro's Markdown processor): every <table>, once.
  return {
    name: 'om-tables',
    element: {
      filter: ['table'],
      visit(node, ctx) {
        const copy = plain(node);
        const cls = copy.properties?.className || [];
        if ((Array.isArray(cls) ? cls : [cls]).includes('om-done')) return;
        addClass(copy, 'om-done');
        const out = table(copy);
        if (out) ctx.replaceNode(node, out);
      },
    },
  };
}
