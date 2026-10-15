---
title: OpenMoat documentation
nav: Introduction
summary: OpenMoat checks every command, file access, web request and MCP call your coding agent makes, blocks the dangerous ones, and leaves everything else to your agent.
---

OpenMoat runs on your machine, next to Claude Code, Codex or Cursor. Before the agent runs a command, reads or writes a file, opens a web page or calls an MCP tool, OpenMoat checks it against one policy that you control. Normal work goes on as before; reading your keys, sending them out, destructive commands and switching OpenMoat off are blocked.

## Start here

:::cards
- [Quick start](quickstart.html) Install, set it up for your agents and see your first block, in about a minute.
- [How it decides](how-it-decides.html) The four answers (allow, defer, ask, deny) and the layers behind them.
- [Something was blocked](blocked.html) What each message means and the one command that fixes it.
- [Commands](commands.html) Every `moat` command on one page.
:::

## Everyday use

Each guide starts from a situation you will meet, shows what you see, and gives one command for it.

:::cards
- [Work across several repos](work-across-repos.html) Let the agent read and edit folders outside the project with `moat allow --dir`.
- [Let the agent use a site](allow-a-site.html) Docs, an API or a registry the policy does not list yet: `moat allow --site`.
- [Keep a token from the agent](keep-tokens-safe.html) The agent holds a placeholder; OpenMoat sends the real token to one host only.
- [See what the agent did](see-what-happened.html) Today's decisions, one session as a timeline, a weekly report.
- [Check a command first](check-a-command.html) The verdict for any command, without running it.
- [Change the rules](change-the-rules.html) Edit the policy safely: checked, diffed, and undoable.
:::

## Common setups

:::cards
- [The project folder](the-project.html) What the agent may do freely, and how monorepos, worktrees and submodules count.
- [.env and variables](env-files.html) Which secrets in files and variables are denied, and how to add your own.
- [GitHub and gh](github.html) Commits, pushes, pull requests and the gh token.
- [Local services](local-services.html) Dev servers, databases and Docker.
- [Cloud CLIs and SSH](cloud-clis.html) Why aws, kubectl and ssh cannot use your credentials from the agent.
- [Install and publish](packages.html) Installs, install scripts and publishing.
:::

:::tip Before you allow anything
[Every allow, and what it opens](allow-reference.html) puts each `moat allow` side by side: what it covers, how long it lasts and what stays protected.
:::

## What it is not

:::note
OpenMoat is not an AI model and does not guess. Written rules decide, so the same call gets the same answer every time, in about 10 ms. Nothing leaves your machine unless you export it. It does not replace your agent's own prompt or sandbox; it fills the gaps between them. What it cannot see is listed in [Limits](limits.html).
:::
