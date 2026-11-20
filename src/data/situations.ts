// The situations of "Where to use it" and which parts of OpenMoat each one uses.
// Checked against the docs' situation pages (src/content/docs/docs/solutions/*.mdx):
// "core" = a part the page's commands or "What it stops" use; "helps" = a part the page
// names as adding to it. A part a page does not name is not marked. Keep both in step.

export type PartId = 'policy' | 'sandbox' | 'egress' | 'secrets' | 'mcp' | 'audit' | 'merge' | 'sdk';

export const parts: { id: PartId; col: string; name: string; does: string; href: string }[] = [
  { id: 'policy', col: 'Policy', name: 'Policy engine', does: 'decides each tool call the hook reports from what it really does, before it runs', href: '/docs/how-it-decides/' },
  { id: 'sandbox', col: 'Sandbox', name: 'OS sandboxes', does: 'confine the code an allowed call runs: the agent’s own sandbox, or openmoat run for any agent', href: '/docs/sandboxes/' },
  { id: 'egress', col: 'Egress', name: 'Egress proxy', does: 'network from the sandbox reaches only the hosts your policy lists', href: '/docs/egress-proxy/' },
  { id: 'secrets', col: 'Secrets', name: 'Token broker', does: 'the agent gets a placeholder; the proxy adds your real token for its one host', href: '/docs/keep-tokens-safe/' },
  { id: 'mcp', col: 'MCP pins', name: 'MCP pinning and gateway', does: 'a new or changed server or tool waits until you accept it', href: '/docs/mcp-servers/' },
  { id: 'audit', col: 'Audit', name: 'Audit log', does: 'every decision in a local, hash-chained log: watch, why, replay, evidence', href: '/docs/see-what-happened/' },
  { id: 'merge', col: 'Merge check', name: 'Merge check', does: 'a pull request’s changes checked with the same rules, in CI or as a GitHub Action', href: '/docs/check-a-pull-request/' },
  { id: 'sdk', col: 'SDK', name: 'SDK', does: 'the same decisions inside your own agent, from Rust or JavaScript', href: '/docs/sdk/' },
];

export type Situation = { id: string; title: string; risk: string; cmd: string; href: string; core: PartId[]; helps: PartId[] };

export const situations: Situation[] = [
  { id: 'laptop', title: 'On a laptop', risk: 'One developer, one or more agents, real keys and SSH config on disk.', cmd: 'openmoat init', href: '/docs/solutions/on-a-laptop/', core: ['policy', 'audit'], helps: ['sandbox'] },
  { id: 'unattended', title: 'Unattended agents', risk: 'Nobody answers prompts: auto-approve, background agents, long runs. A review stops the call; a deny never runs.', cmd: 'openmoat run --write ~/.claude --write ~/.claude.json -- claude', href: '/docs/solutions/unattended-agents/', core: ['policy', 'sandbox', 'egress', 'audit'], helps: ['secrets'] },
  { id: 'mcp', title: 'MCP servers', risk: 'Third-party servers get tool calls and can change between runs.', cmd: 'openmoat mcp wrap github', href: '/docs/solutions/mcp-servers/', core: ['mcp', 'policy'], helps: ['sandbox'] },
  { id: 'team', title: 'A team, one policy', risk: 'Everyone should get the same rules, from the repository or a signed pack, and no repository can loosen anyone’s own.', cmd: 'openmoat trust', href: '/docs/solutions/team-policy/', core: ['policy'], helps: ['sandbox'] },
  { id: 'ci', title: 'CI and pull requests', risk: 'Agent-written changes reach main through pull requests, from machines with OpenMoat and without it.', cmd: 'openmoat policy check-diff --base origin/main', href: '/docs/solutions/ci-and-pull-requests/', core: ['merge'], helps: ['policy'] },
  { id: 'audit', title: 'Audit and compliance', risk: 'You must show what agents were allowed and denied, and that the record was not changed. Evidence, not a certification.', cmd: 'openmoat audit evidence --since 30d', href: '/docs/solutions/audit-evidence/', core: ['audit'], helps: ['policy'] },
  { id: 'product', title: 'Building an agent', risk: 'Your own product runs tools for users and needs the same decision before each one.', cmd: 'npm install @openmoat/sdk', href: '/docs/solutions/agent-products/', core: ['sdk', 'policy'], helps: [] },
];
