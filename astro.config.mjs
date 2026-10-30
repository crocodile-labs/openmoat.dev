// openmoat.dev: the home page (src/pages/index.astro) and the docs (Starlight, /docs/).
// Static output for GitHub Pages; no analytics, no external fonts or scripts.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// An entry is a slug, or a sub-group made with sub(): its overview page first, then its parts.
const item = (entry) => (typeof entry === 'string' ? (entry === 'index' ? 'docs' : `docs/${entry}`) : entry);
const group = (label, entries) => ({ label, items: entries.map(item) });
const sub = (label, overview, parts) => ({
  label,
  collapsed: true,
  items: [{ label: 'Overview', slug: `docs/${overview}` }, ...parts.map((p) => `docs/${overview}/${p}`)],
});

export default defineConfig({
  site: 'https://openmoat.dev',
  trailingSlash: 'ignore',
  integrations: [
    starlight({
      title: 'OpenMoat',
      description: 'Security for AI coding agents: checks every command, file access, web request and MCP call before it runs.',
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
        '@fontsource/geist-mono/400.css',
        '@fontsource/geist-mono/600.css',
        './src/styles/docs.css',
      ],
      sidebar: [
        group('Get started', ['index', 'quickstart', 'your-projects',
          sub('Supported agents', 'agents', ['plugin-loading', 'openclaw', 'opencode']), 'how-it-decides']),
        group('Features', ['shell-commands',
          sub('Secrets and .env files', 'env-files', ['agent-credentials', 'protected-contents']), 'allow-a-site',
          sub('Code the agent wrote', 'session-written-code', ['opaque-code']),
          sub('Token broker', 'keep-tokens-safe', ['token-egress', 'another-service', 'where-it-works', 'https-injection']),
          sub('MCP pinning, gateway and browsers', 'mcp-servers', ['tool-pinning', 'gateway', 'browser-pages']),
          sub('OS sandboxes and run', 'sandboxes', ['openmoat-run']),
          sub('Egress proxy', 'egress-proxy', ['sessions']), 'self-protection', 'session-taint', 'see-what-happened',
          sub('Team rules and packs', 'team-rules', ['repository-policy', 'policy-packs']), 'openmoat-bar']),
        group('Policy', [sub('The policy file', 'policy-file', ['verdicts', 'patterns', 'other-keys', 'repositories']),
          'change-the-rules']),
        group('Guides', ['blocked', 'check-a-command', 'work-across-repos', 'the-project', 'github', 'local-services',
          'cloud-clis', 'packages', 'auto-approve-and-ci', 'sdk', 'upgrade', 'turn-off']),
        group('Reference', [
          sub('Commands', 'commands', ['setup', 'allow', 'policy', 'sandboxes', 'mcp-and-secrets', 'audit-and-diagnostics']),
          'allow-reference',
          sub('Troubleshooting', 'troubleshooting', ['agent-messages', 'openmoat-messages', 'hooks-and-lock', 'policies-and-network']),
          'limits', 'break-openmoat', 'glossary']),
        {
          label: 'Releases',
          collapsed: true,
          items: ['docs/releases', ...['v0-12-0', 'v0-11-0', 'v0-10-1','v0-10-0', 'v0-9-0', 'v0-8-0', 'v0-7-0', 'v0-6-0', 'v0-5', 'v0-1-to-0-4']
            .map((v) => `docs/releases/${v}`)],
        },
      ],
    }),
  ],
});
