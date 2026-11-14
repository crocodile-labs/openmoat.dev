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
        '@fontsource/geist-mono/400.css',
        '@fontsource/geist-mono/600.css',
        './src/styles/docs.css',
      ],
      sidebar: [
        group('Get started', ['index', 'quickstart', 'your-projects',
          sub('Supported agents', 'agents', ['protection', 'plugin-loading', 'openclaw', 'opencode', 'cline', 'goose']), 'editors',
          'how-it-decides']),
        group('Solutions', [{ label: 'Overview', slug: 'docs/solutions' },
          ...['on-a-laptop', 'unattended-agents', 'mcp-servers', 'team-policy', 'ci-and-pull-requests', 'audit-evidence', 'agent-products']
            .map((p) => `solutions/${p}`)]),
        group('Features', ['shell-commands',
          sub('Secrets and .env files', 'env-files', ['agent-credentials', 'protected-contents', 'card-numbers']), 'allow-a-site',
          sub('Code the agent wrote', 'session-written-code', ['opaque-code']), 'runs-later',
          sub('Token broker', 'keep-tokens-safe', ['token-egress', 'another-service', 'where-it-works', 'https-injection', 'short-lived-tokens']),
          sub('MCP pinning, gateway and browsers', 'mcp-servers', ['tool-pinning', 'gateway', 'cross-server', 'browser-pages']),
          sub('OS sandboxes and run', 'sandboxes', ['openmoat-run', 'linux-tiers', 'boundary-record', 'project-files']), 'snapshots',
          sub('Egress proxy', 'egress-proxy', ['sessions']), 'self-protection', 'session-taint', 'injected-input',
          sub('Audit log, watch and why', 'see-what-happened', ['watch-and-why', 'provenance', 'siem-delivery']), 'remote-approvals',
          'openmoat-bar']),
        group('For teams and CI', [sub('Team rules and packs', 'team-rules', ['repository-policy', 'policy-packs', 'required-protection']),
          'check-a-pull-request', 'compliance-evidence', 'auto-approve-and-ci', 'sdk']),
        group('Policy', [sub('The policy file', 'policy-file', ['verdicts', 'patterns', 'other-keys', 'repositories']),
          'change-the-rules']),
        group('Guides', ['blocked', 'check-a-command', 'work-across-repos', 'the-project', 'github', 'local-services',
          'cloud-clis', 'packages']),
        group('Run and maintain', [sub('Upgrade', 'upgrade', ['ask-to-review']), 'turn-off']),
        group('Reference', [
          sub('Commands', 'commands', ['setup', 'allow', 'policy', 'sandboxes', 'mcp-and-secrets', 'audit-and-diagnostics']),
          'allow-reference',
          sub('Troubleshooting', 'troubleshooting', ['agent-messages', 'openmoat-messages', 'hooks-and-lock', 'policies-and-network']),
          'limits', 'break-openmoat', 'glossary']),
        {
          label: 'Releases',
          collapsed: true,
          items: ['docs/releases', ...['v0-21-0', 'v0-20-0', 'v0-19-0', 'v0-18-0', 'v0-17-0', 'v0-16-0', 'v0-15-0', 'v0-14-0', 'v0-13-0', 'v0-12-1', 'v0-12-0', 'v0-11-0', 'v0-10-1','v0-10-0', 'v0-9-0', 'v0-8-0', 'v0-7-0', 'v0-6-0', 'v0-5', 'v0-1-to-0-4']
            .map((v) => `docs/releases/${v}`)],
        },
      ],
    }),
  ],
});
