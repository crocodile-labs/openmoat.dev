// What each agent gets, for the docs' Supported features page. Every cell comes from a
// source named here; a fact no source states is left out (null), not guessed.
//   protection, answer (what a review becomes), hookProven: data/agents.ts
//   hooks (the entries `openmoat init` writes): the openmoat repo's docs/INSTALL.md,
//     "Non-default config directories", the table generated from each agent's HostSpec
//   injected (reports what a call returned, so injected input works): the docs' Injected
//     input page, "Which agents" and its limits ("Other agents report none yet")
//   written (running code the session wrote needs review): docs/USAGE.md, the list of
//     agents without an OS sandbox from OpenMoat; Codex, Claude Code and Cursor get an
//     OS sandbox from OpenMoat (data/agents.ts), where the rule does not apply
import { agents } from './agents';

type Extra = { hooks: string; injected: string | null; written: string | null };

const extra: Record<string, Extra> = {
  'claude-code': { hooks: 'PreToolUse, ConfigChange, SessionStart, PostToolUse', injected: 'yes, since 0.16.0 (PostToolUse)', written: 'only on native Windows or with its sandbox not in place' },
  codex: { hooks: 'PreToolUse, PostToolUse', injected: 'yes, since 0.21.0 (PostToolUse)', written: 'no: OpenMoat sets up its sandbox' },
  cursor: { hooks: 'beforeShellExecution, beforeMCPExecution, beforeReadFile, preToolUse, beforeTabFileRead', injected: 'not yet', written: 'only on native Windows or with its sandbox not in place' },
  openclaw: { hooks: 'before_tool_call', injected: 'not yet', written: 'yes' },
  'copilot-cli': { hooks: 'preToolUse, postToolUse', injected: 'yes, since 0.21.0 (postToolUse)', written: 'yes' },
  pi: { hooks: 'tool_call', injected: 'not yet', written: 'yes' },
  'gemini-cli': { hooks: 'BeforeTool, AfterTool', injected: 'yes, since 0.21.0 (AfterTool)', written: 'yes' },
  opencode: { hooks: 'tool.execute.before (OpenCode 1), execute.before (OpenCode 2)', injected: 'not yet', written: 'yes' },
  hermes: { hooks: 'pre_tool_call', injected: 'not yet', written: 'yes' },
  cline: { hooks: 'PreToolUse, PostToolUse', injected: 'yes, since 0.17.0 (PostToolUse)', written: 'yes' },
  goose: { hooks: 'PreToolUse', injected: 'not yet', written: 'yes' },
  'antigravity-cli': { hooks: 'PreToolUse', injected: 'not yet', written: 'yes' },
  'qwen-code': { hooks: 'PreToolUse', injected: 'not yet', written: null },
  crush: { hooks: 'PreToolUse', injected: 'not yet', written: null },
};

export const rows = agents.map((a) => {
  const e = extra[a.host];
  if (!e) throw new Error(`features: no row for ${a.host}; add it from docs/INSTALL.md`);
  return { ...a, ...e };
});
if (Object.keys(extra).length !== agents.length) throw new Error('features: an agent in extra is not in data/agents.ts');

// The features and where each one works, from the feature pages' own text.
export const byFeature: { name: string; href: string; where: string }[] = [
  { name: 'Policy check of each call the hook reports', href: '/docs/how-it-decides/', where: `Every agent above (${agents.length}).` },
  { name: 'OS sandbox for what an allowed call runs', href: '/docs/sandboxes/', where: 'The agent’s own sandbox for Claude Code (macOS, Linux, WSL2), Codex, and Cursor (macOS, Linux); <code>openmoat run</code> for any agent, on macOS 13 or later and Linux.' },
  { name: 'Egress proxy', href: '/docs/egress-proxy/', where: 'Under <code>openmoat run</code>; for the agents’ own sandboxes with <code>sandbox.proxy_port</code>. The standalone proxy gives a session credential to Claude Code’s sessions only.' },
  { name: 'Token broker over HTTPS', href: '/docs/keep-tokens-safe/', where: 'Through Claude Code’s own sandbox broker, and inside <code>openmoat run</code> for a <code>tls: terminate</code> secret. Elsewhere a request over HTTPS keeps the placeholder.' },
  { name: 'Injected input', href: '/docs/injected-input/', where: 'Claude Code, Codex, Gemini CLI, GitHub Copilot CLI, the Cline CLI, and wrapped MCP servers (for every agent).' },
  { name: 'Review of code the session wrote', href: '/docs/session-written-code/', where: 'Agents without an OS sandbox from OpenMoat, and Claude Code and Cursor on native Windows or with their sandbox not in place.' },
  { name: 'MCP gateway (tool pinning, cross-server check)', href: '/docs/mcp-servers/gateway/', where: 'A stdio server you wrap with <code>openmoat mcp wrap</code>, or every one with <code>openmoat init --mcp-proxy</code>.' },
  { name: 'Merge check', href: '/docs/check-a-pull-request/', where: 'Any pull request, whoever wrote it: <code>openmoat policy check-diff</code> and the GitHub Action.' },
];
