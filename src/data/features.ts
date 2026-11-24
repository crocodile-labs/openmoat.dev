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
//   liveness (since 0.25.0; says when the agent stops running the hook): ADR-104's
//     table of session places and docs/USAGE.md "Does the agent still run OpenMoat's
//     hook?"; for the plugin agents, USAGE.md "Did the agent load OpenMoat's plugin?"
//   start (since 0.25.0; a sandboxed-start shim at `openmoat init`): ADR-106 §4, which
//     offers one to agents whose spec has `RunFacts::Known`; the others' `RunFacts::Unknown`
//     reasons are from their host specs. Qwen Code and Crush: `RunFacts::Known` since
//     0.26.0 (ADR-108 §5, docs/SANDBOX.md "Agents OpenMoat writes no sandbox for")
//     OpenClaw: since 0.27.0 its Gateway alone, on Linux with a network namespace
//     (docs/SANDBOX.md "OpenClaw under `openmoat run`", ADR-108 §7)
// The rows of byFeature from Protection score on came with 0.26.0, from its ADRs (108 to 115)
// and docs/USAGE.md, POLICY.md, SANDBOX.md and INSTALL.md "From 0.25.0 to 0.26.0". The rows
// from Hidden commands on came with 0.27.0, from ADR-116 to ADR-121, docs/USAGE.md,
// POLICY.md §2.2.1, TEAM.md, SANDBOX.md, LIMITS.md and INSTALL.md "From 0.26.0 to 0.27.0".
import { agents } from './agents';

type Extra = { hooks: string; injected: string | null; written: string | null; liveness: string | null; start: string | null };

const sessions = 'warns when it ran sessions and no call came';
const unknown = 'a note only: OpenMoat does not know where it writes a session';
const shim = 'yes, for <code>openmoat run</code>';
const ownSandbox = 'no: OpenMoat sets up its own OS sandbox';

const extra: Record<string, Extra> = {
  'claude-code': { hooks: 'PreToolUse, ConfigChange, SessionStart, PostToolUse', injected: 'yes, since 0.16.0 (PostToolUse)', written: 'only on native Windows or with its sandbox not in place', liveness: sessions, start: ownSandbox },
  codex: { hooks: 'PreToolUse, PostToolUse', injected: 'yes, since 0.21.0 (PostToolUse)', written: 'no: OpenMoat sets up its sandbox', liveness: `${sessions}; <code>config.toml</code> changing counts`, start: ownSandbox },
  cursor: { hooks: 'beforeShellExecution, beforeMCPExecution, beforeReadFile, preToolUse, beforeTabFileRead', injected: 'not yet', written: 'only on native Windows or with its sandbox not in place', liveness: `${sessions} (the Cursor CLI; the editor's chats are not seen)`, start: ownSandbox },
  openclaw: { hooks: 'before_tool_call', injected: 'not yet', written: 'yes', liveness: 'the plugin reports loading; a note only, its sessions are in a database', start: 'Linux with a network namespace only, since 0.27.0: the shim confines <code>openclaw gateway</code> with <code>openmoat run --listen</code>; refused on macOS and Windows' },
  'copilot-cli': { hooks: 'preToolUse, postToolUse', injected: 'yes, since 0.21.0 (postToolUse)', written: 'yes', liveness: sessions, start: shim },
  pi: { hooks: 'tool_call', injected: 'not yet', written: 'yes', liveness: 'the plugin reports loading; warns when it ran without', start: shim },
  'gemini-cli': { hooks: 'BeforeTool, AfterTool', injected: 'yes, since 0.21.0 (AfterTool)', written: 'yes', liveness: sessions, start: shim },
  opencode: { hooks: 'tool.execute.before (OpenCode 1), execute.before (OpenCode 2)', injected: 'not yet', written: 'yes', liveness: 'the plugin reports loading; a note only, its sessions are in a database', start: shim },
  hermes: { hooks: 'pre_tool_call', injected: 'not yet', written: 'yes', liveness: unknown, start: shim },
  cline: { hooks: 'PreToolUse, PostToolUse', injected: 'yes, since 0.17.0 (PostToolUse)', written: 'yes', liveness: sessions, start: shim },
  goose: { hooks: 'PreToolUse', injected: 'not yet', written: 'yes', liveness: unknown, start: shim },
  'antigravity-cli': { hooks: 'PreToolUse', injected: 'not yet', written: 'yes', liveness: unknown, start: shim },
  'qwen-code': { hooks: 'PreToolUse', injected: 'not yet', written: null, liveness: sessions, start: `${shim} (since 0.26.0)` },
  crush: { hooks: 'PreToolUse', injected: 'not yet', written: null, liveness: unknown, start: `${shim} (since 0.26.0)` },
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
  { name: 'OS sandbox for what an allowed call runs', href: '/docs/sandboxes/', where: 'The agent’s own sandbox for Claude Code (macOS, Linux, WSL2), Codex, and Cursor (macOS, Linux); <code>openmoat run</code> for any agent, on macOS 13 or later and Linux; on native Windows a preview that holds writes and the process tree, not reads or the network (since 0.26.0).' },
  { name: 'Egress proxy', href: '/docs/egress-proxy/', where: 'Under <code>openmoat run</code>; for the agents’ own sandboxes with <code>sandbox.proxy_port</code>. The standalone proxy gives a session credential to Claude Code’s sessions only.' },
  { name: 'Token broker over HTTPS', href: '/docs/keep-tokens-safe/', where: 'Through Claude Code’s own sandbox broker, and inside <code>openmoat run</code> for a <code>tls: terminate</code> secret. Elsewhere a request over HTTPS keeps the placeholder.' },
  { name: 'Injected input', href: '/docs/injected-input/', where: 'Claude Code, Codex, Gemini CLI, GitHub Copilot CLI, the Cline CLI, and wrapped MCP servers (for every agent).' },
  { name: 'Review of code the session wrote', href: '/docs/session-written-code/', where: 'Agents without an OS sandbox from OpenMoat, and Claude Code and Cursor on native Windows or with their sandbox not in place.' },
  { name: 'MCP gateway (tool pinning, cross-server check)', href: '/docs/mcp-servers/gateway/', where: 'A stdio server you wrap with <code>openmoat mcp wrap</code>, or every one with <code>openmoat init --mcp-proxy</code>.' },
  { name: 'Merge check', href: '/docs/check-a-pull-request/', where: 'Any pull request, whoever wrote it: <code>openmoat policy check-diff</code> and the GitHub Action.' },
  { name: 'Is my agent still protected?', href: '/docs/hook-liveness/', where: 'A warning in <code>status</code>, <code>doctor</code> and <code>watch</code> for Claude Code, Codex, the Cursor CLI, GitHub Copilot CLI, Gemini CLI, Qwen Code and the Cline CLI; a note only for goose, Hermes Agent, Antigravity CLI and Crush.' },
  { name: 'Scrubbed environment', href: '/docs/sandboxes/scrubbed-environment/', where: 'Every agent started with <code>openmoat run</code>, with <code>sandbox.env: scrubbed</code> or <code>--scrub-env</code>; off by default. Not the agents’ own sandboxes.' },
  { name: 'Decoy keys', href: '/docs/env-files/decoy-keys/', where: 'Every agent, at your yes in <code>openmoat init</code>; a decoy’s value is also refused at <code>openmoat proxy</code>.' },
  { name: 'Start agents sandboxed', href: '/docs/sandboxes/sandboxed-start/', where: 'Gemini CLI, OpenCode, Hermes Agent, pi, goose, Antigravity CLI, GitHub Copilot CLI and the Cline CLI, at your yes in <code>openmoat init</code>, on macOS 13 or later and Linux; Qwen Code and Crush too since 0.26.0.' },
  { name: 'Protection score and strict mode', href: '/docs/sandboxes/protection-score/', where: 'Every <code>openmoat run</code> tier in <code>openmoat doctor</code> and the boundary record; <code>sandbox.strict: true</code> in your own policy refuses a run below 100. Landlock UDP rules on Linux 7.2 or later.' },
  { name: 'openmoat run on Windows (preview)', href: '/docs/sandboxes/windows/', where: 'Native Windows: a write-restricted token in a job object. Writes outside the project and the process tree are held; reads and the network are not. Scores at most 55 of 100.' },
  { name: 'Other hooks the agents run', href: '/docs/other-hooks/', where: 'The hook files, helper commands, plugin hooks and project hook files of the agents OpenMoat reads, and every repository’s <code>.git/config</code> programs; <code>openmoat hooks list</code> and <code>accept</code>. Fail-safe hook commands for Codex, Gemini CLI, Qwen Code and Crush.' },
  { name: 'Signed audit checkpoints', href: '/docs/see-what-happened/signed-checkpoints/', where: 'Every agent’s audit log: <code>openmoat audit checkpoint</code>, checked anywhere with <code>audit verify --checkpoint --pubkey</code>. What ran after a review: Claude Code only.' },
  { name: 'Does a change widen?', href: '/docs/policy-file/never-widen/', where: '<code>openmoat policy diff --widen</code>, <code>policy upgrade</code> (<code>--accept-widening</code>), <code>trust</code>, <code>policy install</code> and the merge check’s <code>diff-widens</code>.' },
  { name: 'Private data, untrusted content and a way out', href: '/docs/lethal-trifecta/', where: 'Every agent’s sessions, by default (<code>lethal-trifecta</code>), and <code>staging-egress</code> after <code>openmoat policy upgrade</code>. Not inside <code>openmoat run</code>’s proxy.' },
  { name: 'Argument conditions (when:)', href: '/docs/policy-file/argument-conditions/', where: 'Deny and review rules of a policy; the hook and the MCP gateway read the arguments, OS sandboxes do not.' },
  { name: 'MCP 2026-07-28, sampling and package releases', href: '/docs/mcp-servers/protocol-2026-07-28/', where: 'Stdio servers through <code>openmoat mcp proxy</code>; package release pins for wrapped and unwrapped servers started with <code>npx</code>, <code>uvx</code> or <code>docker run</code>.' },
  { name: 'Default rules from outside benchmarks', href: '/docs/benchmarks/#what-the-measurement-changed', where: 'Every agent, after <code>openmoat policy upgrade</code>: <code>system-files</code>, <code>stops-system</code>, <code>credential-egress</code> and more in <code>secrets-paths</code>, <code>persistence</code> and <code>token-egress</code>.' },
  { name: 'Hidden commands and PowerShell (PowerShell in preview)', href: '/docs/shell-commands/obfuscation-and-powershell/', where: 'Every agent’s shell calls: <code>obfuscated</code> after <code>openmoat policy upgrade</code>. PowerShell lines from Claude Code’s <code>PowerShell</code> tool and the agents’ shell tools on Windows, and <code>pwsh</code> or <code>powershell</code> inside a POSIX line; never allowed on the reading alone (since 0.27.0).' },
  { name: 'A slow check is denied', href: '/docs/hook-deadline/', where: 'Every agent, at 30 s (25 s for Hermes Agent); it matters most for Codex, GitHub Copilot CLI, Gemini CLI, Qwen Code, Crush, the Cline CLI and the Antigravity CLI, which run a call whose hook timed out (since 0.27.0).' },
  { name: 'A code before anything is loosened', href: '/docs/self-protection/loosening-gate/', where: 'Optional, after <code>openmoat gate setup</code>: every command that loosens the protection, for every agent. The <code>policy-changes</code> record is on for everyone (since 0.27.0).' },
  { name: 'Minted credentials (preview)', href: '/docs/keep-tokens-safe/minted-credentials/', where: 'Inside <code>openmoat run</code> (and <code>openmoat proxy</code>): GitHub App tokens, AWS STS credentials, Google Cloud tokens; <code>helper:</code> for git and the AWS tools inside <code>openmoat run</code> only. Not from a <code>gh</code> login (since 0.27.0).' },
  { name: 'Team mode', href: '/docs/team-rules/team-mode/', where: 'Every machine that runs <code>openmoat team join</code>; <code>openmoat inventory</code> as JSON or OCSF 1.3.0, <code>--check</code> for a scheduled job, <code>--deliver</code> to sinks with <code>inventory: true</code> (since 0.27.0).' },
  { name: 'Confine agents by default', href: '/docs/sandboxes/confine/', where: 'Each hook-only agent <code>openmoat run</code> can confine on this machine, at your yes in <code>openmoat init</code> or with <code>openmoat confine</code>; OpenClaw’s Gateway with <code>--listen</code> on Linux with a network namespace only (since 0.27.0).' },
  { name: 'Session taint across a policy change', href: '/docs/session-taint/#across-a-policy-change', where: 'Every agent’s sessions; Claude Code catches up to the new policy in the background, other agents keep the carried taint for the session (since 0.27.0).' },
];
