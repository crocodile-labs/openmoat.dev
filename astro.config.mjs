// openmoat.dev: the home page (src/pages/index.astro) and the docs (Starlight, /docs/).
// Static output for GitHub Pages; no analytics, no external fonts or scripts.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const group = (label, slugs) => ({
  label,
  items: slugs.map((slug) => (slug === 'index' ? 'docs' : `docs/${slug}`)),
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
        group('Get started', ['index', 'quickstart', 'agents', 'how-it-decides']),
        group('Features', ['shell-commands', 'env-files', 'allow-a-site', 'keep-tokens-safe', 'mcp-servers',
          'sandboxes', 'egress-proxy', 'self-protection', 'session-taint', 'see-what-happened', 'team-rules']),
        group('Policy', ['policy-file', 'change-the-rules']),
        group('Guides', ['blocked', 'check-a-command', 'work-across-repos', 'the-project', 'github', 'local-services',
          'cloud-clis', 'packages', 'auto-approve-and-ci', 'upgrade', 'turn-off']),
        group('Reference', ['commands', 'allow-reference', 'troubleshooting', 'limits']),
      ],
    }),
  ],
});
