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
//   liveness (next release; says when the agent stops running the hook): ADR-104's
//     table of session places and docs/USAGE.md "Does the agent still run OpenMoat's
//     hook?"; for the plugin agents, USAGE.md "Did the agent load OpenMoat's plugin?"
//   start (next release; a sandboxed-start shim at `openmoat init`): ADR-106 §4, which
//     offers one to agents whose spec has `RunFacts::Known`; the others' `RunFacts::Unknown`
//     reasons are from their host specs
// `next: true` marks what is in the next release, not in 0.24.0: at that release, delete
// every `next: true` and set NEXT to '' in components/SupportedFeatures.astro.
import { agents } from './agents';

type Extra = { hooks: string; injected: string | null; written: string | null; liveness: string | null; start: string | null };

const sessions = 'warns when it ran sessions and no call came';
const unknown = 'a note only: OpenMoat does not know where it writes a session';
const shim = 'yes, for <code>openmoat run</code>';
const ownSandbox = 'no: OpenMoat sets up its own OS sandbox';
const unchecked = 'no: which folders it writes outside the project was not checked';

const extra: Record<string, Extra> = {
  'claude-code': { hooks: 'PreToolUse, ConfigChange, SessionStart, PostToolUse', injected: 'yes, since 0.16.0 (PostToolUse)', written: 'only on native Windows or with its sandbox not in place', liveness: sessions, start: ownSandbox },
  codex: { hooks: 'PreToolUse, PostToolUse', injected: 'yes, since 0.21.0 (PostToolUse)', written: 'no: OpenMoat sets up its sandbox', liveness: `${sessions}; <code>config.toml</code> changing counts`, start: ownSandbox },
  cursor: { hooks: 'beforeShellExecution, beforeMCPExecution, beforeReadFile, preToolUse, beforeTabFileRead', injected: 'not yet', written: 'only on native Windows or with its sandbox not in place', liveness: `${sessions} (the Cursor CLI; the editor's chats are not seen)`, start: ownSandbox },
  openclaw: { hooks: 'before_tool_call', injected: 'not yet', written: 'yes', liveness: 'the plugin reports loading; a note only, its sessions are in a database', start: 'no: its Gateway serves a local port, which <code>openmoat run</code> does not allow' },
  'copilot-cli': { hooks: 'preToolUse, postToolUse', injected: 'yes, since 0.21.0 (postToolUse)', written: 'yes', liveness: sessions, start: shim },
  pi: { hooks: 'tool_call', injected: 'not yet', written: 'yes', liveness: 'the plugin reports loading; warns when it ran without', start: shim },
  'gemini-cli': { hooks: 'BeforeTool, AfterTool', injected: 'yes, since 0.21.0 (AfterTool)', written: 'yes', liveness: sessions, start: shim },
  opencode: { hooks: 'tool.execute.before (OpenCode 1), execute.before (OpenCode 2)', injected: 'not yet', written: 'yes', liveness: 'the plugin reports loading; a note only, its sessions are in a database', start: shim },
  hermes: { hooks: 'pre_tool_call', injected: 'not yet', written: 'yes', liveness: unknown, start: shim },
  cline: { hooks: 'PreToolUse, PostToolUse', injected: 'yes, since 0.17.0 (PostToolUse)', written: 'yes', liveness: sessions, start: shim },
  goose: { hooks: 'PreToolUse', injected: 'not yet', written: 'yes', liveness: unknown, start: shim },
  'antigravity-cli': { hooks: 'PreToolUse', injected: 'not yet', written: 'yes', liveness: unknown, start: shim },
  'qwen-code': { hooks: 'PreToolUse', injected: 'not yet', written: null, liveness: sessions, start: unchecked },
  crush: { hooks: 'PreToolUse', injected: 'not yet', written: null, liveness: unknown, start: unchecked },
};

export const rows = agents.map((a) => {
  const e = extra[a.host];
  if (!e) throw new Error(`features: no row for ${a.host}; add it from docs/INSTALL.md`);
  return { ...a, ...e };
});
if (Object.keys(extra).length !== agents.length) throw new Error('features: an agent in extra is not in data/agents.ts');

// The features and where each one works, from the feature pages' own text.
export const byFeature: { name: string; href: string; where: string; next?: boolean }[] = [
  { name: 'Policy check of each call the hook reports', href: '/docs/how-it-decides/', where: `Every agent above (${agents.length}).` },
  { name: 'OS sandbox for what an allowed call runs', href: '/docs/sandboxes/', where: 'The agent’s own sandbox for Claude Code (macOS, Linux, WSL2), Codex, and Cursor (macOS, Linux); <code>openmoat run</code> for any agent, on macOS 13 or later and Linux.' },
  { name: 'Egress proxy', href: '/docs/egress-proxy/', where: 'Under <code>openmoat run</code>; for the agents’ own sandboxes with <code>sandbox.proxy_port</code>. The standalone proxy gives a session credential to Claude Code’s sessions only.' },
  { name: 'Token broker over HTTPS', href: '/docs/keep-tokens-safe/', where: 'Through Claude Code’s own sandbox broker, and inside <code>openmoat run</code> for a <code>tls: terminate</code> secret. Elsewhere a request over HTTPS keeps the placeholder.' },
  { name: 'Injected input', href: '/docs/injected-input/', where: 'Claude Code, Codex, Gemini CLI, GitHub Copilot CLI, the Cline CLI, and wrapped MCP servers (for every agent).' },
  { name: 'Review of code the session wrote', href: '/docs/session-written-code/', where: 'Agents without an OS sandbox from OpenMoat, and Claude Code and Cursor on native Windows or with their sandbox not in place.' },
  { name: 'MCP gateway (tool pinning, cross-server check)', href: '/docs/mcp-servers/gateway/', where: 'A stdio server you wrap with <code>openmoat mcp wrap</code>, or every one with <code>openmoat init --mcp-proxy</code>.' },
  { name: 'Merge check', href: '/docs/check-a-pull-request/', where: 'Any pull request, whoever wrote it: <code>openmoat policy check-diff</code> and the GitHub Action.' },
  { name: 'Is my agent still protected?', href: '/docs/hook-liveness/', where: 'A warning in <code>status</code>, <code>doctor</code> and <code>watch</code> for Claude Code, Codex, the Cursor CLI, GitHub Copilot CLI, Gemini CLI, Qwen Code and the Cline CLI; a note only for goose, Hermes Agent, Antigravity CLI and Crush.', next: true },
  { name: 'Scrubbed environment', href: '/docs/sandboxes/scrubbed-environment/', where: 'Every agent started with <code>openmoat run</code>, with <code>sandbox.env: scrubbed</code> or <code>--scrub-env</code>; off by default. Not the agents’ own sandboxes.', next: true },
  { name: 'Decoy keys', href: '/docs/env-files/decoy-keys/', where: 'Every agent, at your yes in <code>openmoat init</code>; a decoy’s value is also refused at <code>openmoat proxy</code>.', next: true },
  { name: 'Start agents sandboxed', href: '/docs/sandboxes/sandboxed-start/', where: 'Gemini CLI, OpenCode, Hermes Agent, pi, goose, Antigravity CLI, GitHub Copilot CLI and the Cline CLI, at your yes in <code>openmoat init</code>, on macOS 13 or later and Linux.', next: true },
];
