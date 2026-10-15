---
title: Limits
nav: Limits
summary: What OpenMoat does not stop, so you know where it ends.
when: you are deciding how far to trust it, or something got through.
---

OpenMoat does not replace your agent's prompt or sandbox; it fills the gaps between them. These are the gaps that remain.

:::cards
- [A deferred call runs if your agent lets it](auto-approve-and-ci.html) In auto-approve modes only deny and ask stop a call.
- [Allowed scripts run what they contain](how-it-decides.html) `npm test` is allowed; the sandbox bounds what its script can reach, OpenMoat does not read it.
- [Allowed hosts can receive data](allow-a-site.html) The proxy checks the host, not what is sent inside HTTPS.
- [Tools no hook exposes are not seen](auto-approve-and-ci.html) Codex web search and hosted tools, for example.
:::

## In detail

- **Cursor** runs a command outside the sandbox OpenMoat configures when its Auto-review approves it, in Run Everything mode, and in the Cursor CLI without `--sandbox enabled`; inside the workspace its sandbox cannot deny `.env` or `.git`.
- **Claude Code's sandbox** covers `Bash`, `PowerShell` and `Monitor`. File tools, `WebFetch` and MCP servers are checked by the hook only.
- **On Linux**, `moat run` does not protect files inside the project (`.env`, `.envrc`, `.moat`, `.git` hooks); `moat run --isolate` does.
- **On native Windows** only the hook applies the policy; use WSL2 for the OS sandbox.
- **A missing hook binary:** if `moat` is missing or killed, Claude Code and Codex run the call unchecked. `moat status` reports it.
- **Files you run later.** An agent may edit `package.json` scripts, a `Makefile` or other build files without a question; they run when you next build. CI workflows and commit-hook files ask first (`runs-later`), but only for the agent's own writes: a script the agent runs in its sandbox may still write them.
- **Folders allowed with `moat allow` before 0.5.2** do not leave out `.git` and the files run later: add them again ([Work across several repos](work-across-repos.html)).

The full list, with the reasons: [THREAT_MODEL.md](https://github.com/crocodile-labs/openmoat/blob/main/docs/THREAT_MODEL.md). What each layer stops is tested on every change: [EVIDENCE.md](https://github.com/crocodile-labs/openmoat/blob/main/docs/EVIDENCE.md).
