// openmoat.dev: the home page (src/pages/index.astro) and the docs (Starlight, /docs/).
// Static output for GitHub Pages; no analytics, no external fonts or scripts.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import omTables from './src/plugins/om-tables.mjs';
import { agents as logos } from './src/data/logos.ts';

// Code blocks: the home page's dark terminal windows, in the light and the dark theme.
const term = { bg: '#13201a', bar: '#0b130f', line: '#22332a', fg: '#dfe9e3', dim: '#8fa69a' };
const expressiveCode = {
  themes: ['github-dark-default'],
  useStarlightUiThemeColors: false,
  defaultProps: {
    frame: 'terminal',
    // files keep an editor frame; command lines and output get the terminal's dots
    overridesByLang: { 'yaml,yml,json,jsonc,toml,js,ts,rust,markdown,md,diff,html,css': { frame: 'code' } },
  },
  styleOverrides: {
    borderRadius: '16px',
    borderColor: term.line,
    codeBackground: term.bg,
    codeFontFamily: "'Geist Mono', ui-monospace, monospace",
    codeFontSize: '0.84rem',
    codeLineHeight: '1.65',
    uiFontFamily: "'Geist Sans', system-ui, sans-serif",
    frames: {
      shadowColor: 'rgba(19, 32, 26, 0.18)',
      terminalBackground: term.bg,
      terminalTitlebarBackground: term.bar,
      terminalTitlebarBorderBottomColor: term.line,
      terminalTitlebarForeground: term.dim,
      terminalTitlebarDotsForeground: '#5f7a6c',
      terminalTitlebarDotsOpacity: '1',
      editorBackground: term.bg,
      editorTabBarBackground: term.bar,
      editorTabBarBorderBottomColor: term.line,
      editorActiveTabBackground: term.bg,
      editorActiveTabForeground: term.fg,
      editorActiveTabIndicatorTopColor: '#3fb177',
      editorActiveTabBorderColor: term.line,
      inlineButtonForeground: term.fg,
      inlineButtonBorder: term.dim,
    },
  },
};

// An entry is a slug, or a sub-group made with sub(): its overview page first, then its parts.
// A [label, slug] pair gives the entry a menu label of its own; a slug that starts with /
// is a page outside the docs (Get started, Where to use it).
const slug = (s) => (s === 'index' ? 'docs' : `docs/${s}`);
const item = (entry) => {
  if (typeof entry === 'string') return slug(entry);
  if (Array.isArray(entry)) {
    const [label, to] = entry;
    return to.startsWith('/') ? { label, link: to } : { label, slug: slug(to) };
  }
  return entry;
};
const group = (label, entries) => ({ label, items: entries.map(item) });
const sub = (label, overview, parts) => ({
  label,
  collapsed: true,
  items: [{ label: 'Overview', slug: `docs/${overview}` }, ...parts.map((p) => `docs/${overview}/${p}`)],
});

export default defineConfig({
  site: 'https://openmoat.dev',
  trailingSlash: 'ignore',
  markdown: { processor: satteri({ hastPlugins: [omTables({ logos })] }) },
  // Pages that were removed: old links land on the docs instead of a 404.
  redirects: {
    '/openmoat-bar': '/docs/',
    '/docs/openmoat-bar': '/docs/',
  },
  integrations: [
    starlight({
      title: 'OpenMoat',
      // the site's own 404 page (src/pages/404.astro) serves every missing page
      disable404Route: true,
      expressiveCode,
      description: 'The security layer between your AI coding agents and your machine: checks every tool call before it runs, keeps secrets and network out of reach, confines the code that does run, and records every decision.',
      logo: { src: './public/assets/logo.svg', alt: 'OpenMoat' },
      favicon: '/assets/logo.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/crocodile-labs/openmoat' },
        { icon: 'reddit', label: 'r/openmoat', href: 'https://www.reddit.com/r/openmoat/' },
      ],
      editLink: { baseUrl: 'https://github.com/crocodile-labs/openmoat.dev/edit/main/' },
      lastUpdated: true,
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      customCss: [
        '@fontsource/geist-sans/400.css',
        '@fontsource/geist-sans/500.css',
        '@fontsource/geist-sans/600.css',
        '@fontsource/geist-sans/800.css',
        '@fontsource/geist-mono/400.css',
        '@fontsource/geist-mono/600.css',
        './src/styles/docs.css',
      ],
      // The groups of the approved docs layout. Only the menu changed: every page keeps
      // its URL, so links from outside still work. A [label, slug] pair renames an entry
      // in the menu only.
      sidebar: [
        group('Start', ['index', ['Get started in three steps', '/get-started/'], 'quickstart', 'how-it-decides', 'your-projects',
          sub('Upgrade', 'upgrade', ['ask-to-review'])]),
        group('By situation', [{ label: 'Overview', slug: 'docs/solutions' }, ['Where to use it: all at once', '/where-to-use-it/'],
          ...['on-a-laptop', 'unattended-agents', 'mcp-servers', 'team-policy', 'ci-and-pull-requests', 'audit-evidence', 'agent-products']
            .map((p) => `solutions/${p}`)]),
        group('Features', [['Policy engine: shell commands', 'shell-commands'],
          sub('OS sandboxes and run', 'sandboxes', ['openmoat-run', 'linux-tiers', 'boundary-record', 'project-files', 'scrubbed-environment', 'sandboxed-start', 'protection-score', 'windows']),
          sub('Egress proxy', 'egress-proxy', ['sessions']), ['Network allowlist', 'allow-a-site'],
          sub('Token broker', 'keep-tokens-safe', ['token-egress', 'another-service', 'where-it-works', 'https-injection', 'short-lived-tokens']),
          sub('Secrets and .env files', 'env-files', ['agent-credentials', 'protected-contents', 'card-numbers', 'decoy-keys']),
          sub('MCP pinning, gateway and browsers', 'mcp-servers', ['tool-pinning', 'gateway', 'cross-server', 'browser-pages', 'protocol-2026-07-28']),
          'session-taint', ['Private data and a way out', 'lethal-trifecta'], 'injected-input',
          sub('Code the agent wrote', 'session-written-code', ['opaque-code']), 'runs-later', 'self-protection', ['Is my agent still protected?', 'hook-liveness'], 'other-hooks', 'snapshots',
          sub('Audit log, watch and why', 'see-what-happened', ['watch-and-why', 'provenance', 'siem-delivery', 'signed-checkpoints']),
          ['Merge check', 'check-a-pull-request'],
          sub('Team rules and packs', 'team-rules', ['repository-policy', 'policy-packs', 'required-protection']),
          'compliance-evidence', 'auto-approve-and-ci', 'remote-approvals', 'sdk']),
        group('Something blocked?', [['Why it was blocked', 'blocked'], 'check-a-command', ['Allow it: every allow and its impact', 'allow-reference'],
          'work-across-repos', 'the-project', 'github', 'local-services', 'cloud-clis', 'packages',
          sub('Troubleshooting', 'troubleshooting', ['agent-messages', 'openmoat-messages', 'hooks-and-lock', 'policies-and-network']),
          ['Turn it off for a project', 'turn-off']]),
        group('Agents', [sub('Supported agents', 'agents', ['protection', 'plugin-loading', 'openclaw', 'opencode', 'cline', 'goose']),
          'supported-features', 'editors']),
        group('Reference', [
          sub('Commands', 'commands', ['setup', 'allow', 'policy', 'sandboxes', 'mcp-and-secrets', 'audit-and-diagnostics']),
          sub('The policy file', 'policy-file', ['verdicts', 'patterns', 'other-keys', 'repositories', 'argument-conditions', 'never-widen']), 'change-the-rules',
          'glossary', 'limits', 'benchmarks', 'break-openmoat']),
        {
          label: 'Releases',
          collapsed: true,
          items: ['docs/releases', ...['v0-25-0', 'v0-24-0', 'v0-23-1', 'v0-23-0', 'v0-22-1', 'v0-22-0', 'v0-21-0', 'v0-20-0', 'v0-19-0', 'v0-18-0', 'v0-17-0', 'v0-16-0', 'v0-15-0', 'v0-14-0', 'v0-13-0', 'v0-12-1', 'v0-12-0', 'v0-11-0', 'v0-10-1','v0-10-0', 'v0-9-0', 'v0-8-0', 'v0-7-0', 'v0-6-0', 'v0-5', 'v0-1-to-0-4']
            .map((v) => `docs/releases/${v}`)],
        },
      ],
    }),
  ],
});
