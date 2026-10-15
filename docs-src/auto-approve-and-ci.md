---
title: Auto-approve and CI
nav: Auto-approve and CI
summary: What OpenMoat stops when nobody is there to answer a prompt, and how to run a whole agent in a sandbox.
when: you run an agent with auto-approve (`--dangerously-skip-permissions`, Run Everything), in CI, or as a background agent.
---

OpenMoat leaves calls it has no rule for (**defer**) to your agent's own prompt. In auto-approve modes there is no prompt, so:

| Answer | With a prompt | In auto-approve |
|---|---|---|
| allow | runs | runs |
| defer | your agent asks you | **runs** |
| ask | you are asked | stopped |
| deny | blocked | blocked |

Everything the default policy denies stays denied: secrets, unknown hosts, `curl … | sh`, destructive commands, changes to OpenMoat. What changes is that installs, pushes and other unlisted commands run without a question.

## Run a whole agent in a sandbox

```bash
moat run -- claude --dangerously-skip-permissions
moat run --isolate -- codex          # Linux: the agent sees only the project, the read roots and temp
```

`moat run` starts the agent inside an OS sandbox generated from your policy (macOS 14 or later, Linux). It covers every process the agent starts, but is coarser per command than the hook.

:::warning Linux and project files
On Linux, plain `moat run` does not protect files inside the project (`.env`, `.git` hooks, `.moat`). Use `moat run --isolate` (bubblewrap) for that.
:::

## Per agent

- **Codex** cannot show an OpenMoat prompt: an ask becomes a deny you approve with `moat allow --last`. A deferred call follows Codex's own approval policy.
- **Cursor** runs some commands outside the sandbox OpenMoat configures: when its Auto-review approves them, in Run Everything mode, and in the Cursor CLI without `--sandbox enabled`.
- **Claude Code** applies its sandbox to `Bash`, `PowerShell` and `Monitor`; file tools, `WebFetch` and MCP servers are checked by the hook only.

More in [Limits](limits.html).
