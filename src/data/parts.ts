// OpenMoat's eight parts, as the openmoat README's "What OpenMoat is" table names them,
// for the docs home. Each card's terminal lines are real:
//   policy, secrets (env-secrets), lock: `openmoat policy check` runs with the default policy
//   sandbox: the OS answers CI checks (docs/EVIDENCE.md, the OS sandboxes page's table)
//   egress: the proxy's answer in the same CI table, and its body (the Egress proxy page)
//   secrets placeholder: the Token broker page; MCP: crates/openmoat-cli/src/mcp/relay/host.rs
//   audit: `openmoat why --last` in docs/USAGE.md; merge: docs/MERGE_CHECK.md
export type Tone = 'deny' | 'review' | 'allow' | 'dim';
export type Part = {
  id: string; name: string; stops: string; href: string; start: string;
  term: { t: string; tone?: Tone }[];
};

export const parts: Part[] = [
  {
    id: 'policy', name: 'Policy engine', href: '/docs/how-it-decides/', start: 'openmoat init',
    stops: 'A call that reads your keys, sends them out or destroys work, however it is spelled.',
    term: [{ t: "$ openmoat policy check 'd=~/.ssh; cat $d/id_rsa'" }, { t: '✕ deny · secrets-paths', tone: 'deny' }],
  },
  {
    id: 'sandbox', name: 'OS sandboxes', href: '/docs/sandboxes/', start: 'openmoat run',
    stops: 'A test or install script reading your keys or writing outside the project.',
    term: [{ t: '# a test script, inside openmoat run', tone: 'dim' }, { t: '$ cat "$HOME/.ssh/id_rsa"' }, { t: 'EPERM on macOS · EACCES on Linux', tone: 'deny' }],
  },
  {
    id: 'egress', name: 'Egress proxy', href: '/docs/egress-proxy/', start: 'openmoat proxy',
    stops: 'Sandboxed code sending to a host your policy does not list, or to cloud metadata.',
    term: [{ t: '$ curl -fsS -o /dev/null -m 30 http://evil.example/' }, { t: '403 Forbidden · moat proxy: … refused', tone: 'deny' }],
  },
  {
    id: 'secrets', name: 'Secret broker', href: '/docs/keep-tokens-safe/', start: 'openmoat secret add',
    stops: 'The agent reading or leaking an API token it needs to use.',
    term: [{ t: "$ openmoat policy check 'echo $GITHUB_TOKEN'" }, { t: '✕ deny · env-secrets', tone: 'deny' }, { t: '# with the broker, programs hold moat-secret:gh:placeholder', tone: 'dim' }],
  },
  {
    id: 'mcp', name: 'MCP gateway', href: '/docs/mcp-servers/gateway/', start: 'openmoat mcp wrap',
    stops: 'A new or changed MCP server or tool that nobody accepted, and data carried between servers.',
    term: [{ t: '⏺ github - create_issue (MCP)' }, { t: 'OpenMoat holds tool `create_issue` of MCP server `github`: … not the one a person accepted', tone: 'review' }],
  },
  {
    id: 'audit', name: 'Audit trail', href: '/docs/see-what-happened/', start: 'openmoat why --last',
    stops: 'Not knowing what an agent did, or why a call was blocked.',
    term: [{ t: '$ openmoat why --last' }, { t: 'deny secrets-paths  reading or changing your keys and credential files', tone: 'deny' }, { t: 'from    your policy, ~/.moat/policy.yaml:17', tone: 'dim' }],
  },
  {
    id: 'merge', name: 'Merge check', href: '/docs/check-a-pull-request/', start: 'openmoat policy check-diff',
    stops: 'A risky change reaching main through a pull request, whoever wrote it.',
    term: [{ t: '$ openmoat policy check-diff --base origin/main' }, { t: 'deny    .claude/settings.json [kernel-self]', tone: 'deny' }, { t: 'deny: 1 deny, 2 review in 4 changed files', tone: 'dim' }],
  },
  {
    id: 'lock', name: 'Policy lock', href: '/docs/self-protection/', start: 'openmoat doctor',
    stops: 'The agent loosening the rules, approving its own block or switching OpenMoat off.',
    term: [{ t: '$ openmoat policy check "openmoat allow --last"' }, { t: '✕ deny · kernel-self', tone: 'deny' }],
  },
];
