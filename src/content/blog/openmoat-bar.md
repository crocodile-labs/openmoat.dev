---
title: "OpenMoat Bar: your agents' protection, in the menu bar"
description: A small read-only app that shows what OpenMoat decides for your coding agents, without opening a terminal. Which agents are protected, what was blocked and why, and what needs you.
summary: OpenMoat Bar puts a croc in your menu bar or tray. It turns red when an agent stops being protected, lists what was blocked today with the rule and the reason, and never allows anything itself.
date: 2026-10-24T10:00:00Z
author: Dhanasekaran Kathiresan
authorUrl: https://github.com/iamdotk
avatar: /assets/dhanasekaran.jpg
tag: announcement
minutes: 4
tags: ["Announcement", "OpenMoat Bar"]
cover: "brew install --cask crocodile-labs/tap/openmoat-bar"
coverResult: "a croc in your menu bar · read-only"
coverTone: ok
---

We built a small companion app for OpenMoat, so you can see what it decides without opening a terminal 🐊

OpenMoat checks every command, file access, web request and MCP call your coding agent makes, and blocks the dangerous ones before they run. All of that happens quietly in the agent's hook. Until now, the only way to see it was a terminal: `openmoat` for today's picture, `openmoat show` for the calls, `openmoat status` for each agent's protection.

That works when you go looking. It doesn't tell you the moment something changes: an agent update that dropped OpenMoat's hook, a project settings file that switches hooks off, an MCP server that changed overnight. OpenMoat Bar is for that.

![The OpenMoat Bar menu on macOS: every agent's protection, today's blocked calls and one decision in full](/assets/openmoat-bar/menu-macos.jpg)

## A croc in the menu bar

The icon changes with what needs you:

- **plain** when every agent is protected and nothing is new,
- **a dot** when there are new blocks since you last looked,
- **amber** when a security check needs a look,
- **red** the moment an agent stops being protected,
- **faded** when OpenMoat isn't installed or can't be read.

Open it and you get a tab per agent (Claude Code, Codex, Cursor, OpenClaw, GitHub Copilot CLI, pi, Gemini CLI) with its protection level, today's calls per hour, and four groups: blocked, asked, left to your agent, and allowed. Hover a blocked call and you see the whole story: what ran, which rule stopped it, what the agent was told, and why that rule exists.

## What needs you

The menu also shows the things OpenMoat waits for you on:

- an MCP server whose definition or tools changed since you accepted them, with `openmoat mcp accept <server>` to copy,
- a newer default policy, with `openmoat policy upgrade`,
- a pinned file that changed, with `openmoat doctor`,
- a project settings file that could switch OpenMoat off or run a program, with the file and what it sets.

The Details window lists what you allowed (rules, session grants with their project and end time, trusted repositories), your brokered secrets (never their values), and every `openmoat doctor` check, grouped and explained.

## It never allows anything

OpenMoat Bar only reads. It runs a fixed list of read-only commands (`openmoat status`, `show`, `report`, `proxy status`, `allowed`, `secret list`, `doctor`, `--version`, each with `--format json`) and matches whole command lines, so a command that changes something, like `openmoat doctor --accept`, can never run from it. Every fix is a command you copy into your own terminal.

It writes nothing to `~/.moat`, makes no network requests, and its notifications name the rule and the agent, never the command. It always tells you when an agent stops being protected; blocked-call notifications are off until you turn them on.

## Limits

- It shows what `openmoat` reports and adds no protection of its own.
- The Linux and Windows tray apps are built, tested and drawn in CI on Ubuntu and Windows, not yet on many real desktops. Tell us how they behave on yours.
- The macOS app is not signed by Apple yet, so the first time you open it from Finder, right-click it and choose Open.
- Session taint and audit anchors show up only as the `openmoat doctor` lines that mention them.

## Try it

```bash
brew install crocodile-labs/tap/openmoat && openmoat init
brew install --cask crocodile-labs/tap/openmoat-bar
```

On Linux and Windows, the one-line installers are in the [docs](/docs/openmoat-bar/). The source is on [GitHub](https://github.com/crocodile-labs/openmoat-bar).
