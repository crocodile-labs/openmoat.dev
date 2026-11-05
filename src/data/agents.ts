// The agents OpenMoat checks: one list for the home page, the docs introduction, the
// quick start and Supported agents. It follows the OpenMoat README's "Supported agents"
// table (generated from the product's host specs); add an agent here, and in
// data/logos.ts for the logo row, and every page that lists agents picks it up.
//
// `answer` and `note` are small HTML strings: plain text with <code> only.
export type Agent = {
  name: string; // as shown in a table
  inList: string; // as written in a sentence ("the Cline CLI")
  host: string; // `openmoat init --hosts` id
  docs: string; // its section or page in the docs
  sandbox: boolean; // hook + OS sandbox where the platform allows
  protection: string; // the docs' protection column
  protectionShort: string; // the home page's protection line
  protectionSub?: string; // the home page's second line, if any
  answer: string; // where a person answers a review (docs)
  homeAnswer: string; // the same, shorter, for the home page
  note: string; // the home page's "good to know"
};

export const agents: Agent[] = [
  {
    name: 'Claude Code', inList: 'Claude Code', host: 'claude-code', docs: '/docs/agents/#claude-code', sandbox: true,
    protection: 'hook + OS sandbox (macOS, Linux, WSL2); hook only on native Windows',
    protectionShort: 'hook + OS sandbox', protectionSub: 'hook only on native Windows',
    answer: "Claude Code's own prompt", homeAnswer: "Claude Code's own prompt",
    note: 'its sandbox covers shell commands; file tools, web fetches and MCP are checked by the hook',
  },
  {
    name: 'Codex', inList: 'Codex', host: 'codex', docs: '/docs/agents/#codex', sandbox: true,
    protection: 'hook + OS sandbox', protectionShort: 'hook + OS sandbox',
    answer: 'the call is denied; run <code>openmoat allow --last</code>',
    homeAnswer: 'the call stops; run <code>openmoat allow --last</code>',
    note: "trust the hook once in Codex's <code>/hooks</code>; web search and hosted tools are not seen",
  },
  {
    name: 'Cursor', inList: 'Cursor', host: 'cursor', docs: '/docs/agents/#cursor', sandbox: true,
    protection: 'hook + OS sandbox (macOS, Linux); hook only on Windows',
    protectionShort: 'hook + OS sandbox', protectionSub: 'hook only on Windows',
    answer: "Cursor's prompt for shell and MCP calls; <code>openmoat allow --last</code> for file tools",
    homeAnswer: "Cursor's prompt for shell and MCP; <code>openmoat allow --last</code> for files",
    note: 'some commands run outside its sandbox (Run Everything, Auto-review)',
  },
  {
    name: 'OpenClaw', inList: 'OpenClaw', host: 'openclaw', docs: '/docs/agents/#openclaw', sandbox: false,
    protection: 'hook only (a <code>before_tool_call</code> plugin)', protectionShort: 'hook only',
    answer: "OpenClaw's own approval request", homeAnswer: "OpenClaw's own approval request",
    note: "calls run unchecked if the Gateway does not load OpenMoat's plugin; <code>openmoat status</code> says when it has not reported loading",
  },
  {
    name: 'GitHub Copilot CLI', inList: 'GitHub Copilot CLI', host: 'copilot-cli', docs: '/docs/agents/#github-copilot-cli', sandbox: false,
    protection: 'hook only', protectionShort: 'hook only',
    answer: "Copilot's own prompt", homeAnswer: "Copilot's own prompt",
    note: 'a hook that times out lets the call run',
  },
  {
    name: 'pi', inList: 'pi', host: 'pi', docs: '/docs/agents/#pi', sandbox: false,
    protection: 'hook only (an extension)', protectionShort: 'hook only',
    answer: 'a pi dialog', homeAnswer: 'a pi dialog',
    note: 'pi has no prompt of its own, so calls with no rule run',
  },
  {
    name: 'Gemini CLI', inList: 'Gemini CLI', host: 'gemini-cli', docs: '/docs/agents/#gemini-cli', sandbox: false,
    protection: 'hook only', protectionShort: 'hook only',
    answer: "Gemini CLI's own confirmation", homeAnswer: "Gemini CLI's own confirmation",
    note: 'hooks run only in folders it trusts; a hook that times out lets the call run',
  },
  {
    name: 'OpenCode (1 and 2)', inList: 'OpenCode', host: 'opencode', docs: '/docs/agents/opencode/', sandbox: false,
    protection: 'hook only (a plugin)', protectionShort: 'hook only', protectionSub: 'OpenCode 1 (1.3.4 and later) and 2',
    answer: "OpenCode 2's own permission prompt; on OpenCode 1 the call is denied, run <code>openmoat allow --last</code>",
    homeAnswer: "OpenCode 2's own prompt; on OpenCode 1 the call stops, run <code>openmoat allow --last</code>",
    note: "other plugins share its process; OpenCode 2's --auto approves OpenMoat's reviews",
  },
  {
    name: 'Hermes Agent', inList: 'Hermes Agent', host: 'hermes', docs: '/docs/agents/#hermes-agent', sandbox: false,
    protection: 'hook only', protectionShort: 'hook only',
    answer: "Hermes's own approval prompt", homeAnswer: "Hermes's own approval prompt",
    note: 'its plugins and tool middleware can change a call after the check; the in-session /yolo approves reviews unseen',
  },
  {
    name: 'Cline CLI', inList: 'the Cline CLI', host: 'cline', docs: '/docs/agents/cline/', sandbox: false,
    protection: 'hook only (a hook script)', protectionShort: 'hook only',
    answer: "the call is denied, which ends Cline's run; run <code>openmoat allow --last</code>",
    homeAnswer: 'the call stops; run <code>openmoat allow --last</code>',
    note: 'the Cline VS Code extension, <code>--yolo</code> runs and native Windows are not covered',
  },
  {
    name: 'goose', inList: 'goose', host: 'goose', docs: '/docs/agents/goose/', sandbox: false,
    protection: 'hook only (a plugin)', protectionShort: 'hook only',
    answer: 'the call is blocked; run <code>openmoat allow --last</code>',
    homeAnswer: 'the call stops; run <code>openmoat allow --last</code>',
    note: "Code Mode's <code>execute_javascript</code> needs review, since the tool calls it makes skip the hook",
  },
];

// "A, B and C", with each agent's sentence form.
export const agentList = (list: Agent[] = agents): string => {
  const names = list.map((a) => a.inList);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

// "A, B or C".
export const agentListOr = (list: Agent[] = agents): string => {
  const names = list.map((a) => a.inList);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
};

const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
// "eleven": how many agents OpenMoat checks, as a word.
export const agentCount: string = words[agents.length] ?? String(agents.length);

export const sandboxed: Agent[] = agents.filter((a) => a.sandbox);
export const hookOnly: Agent[] = agents.filter((a) => !a.sandbox);
