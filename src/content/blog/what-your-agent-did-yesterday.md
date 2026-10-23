---
title: What did your coding agent do yesterday?
description: The agent's own summary is the agent's account. How OpenMoat keeps a local, hash-chained record of every call it decided, how to read it, and what that record can and can't prove.
summary: openmoat show, replay and report read a local log of every decision. What is in it, why the agent can't read or rewrite it, and why hash-chained means tamper-evident, not tamper-proof.
date: 2026-10-24T09:00:00Z
author: Dhanasekaran Kathiresan
authorUrl: https://github.com/iamdotk
avatar: /assets/dhanasekaran.jpg
tag: guide
minutes: 6
tags: ["Guide", "Audit"]
cover: "openmoat replay --since yesterday"
coverResult: "one tree per session · every call, verdict and rule"
coverTone: ok
---

You let an agent work through a long task, or you ran one in the background overnight. In the morning there is a diff and a summary. The summary says it ran the tests and fixed two files.

What it does not tell you: which commands it ran to get there, which files it read, which hosts it tried to reach, and which of those were stopped. The terminal scrollback is gone or a thousand lines long. And the summary is written by the agent itself, the same agent that may have read a web page or an issue telling it to do something else.

I build OpenMoat, which checks each action an AI coding agent takes on your computer and stops the dangerous ones before they run. Every one of those decisions is written to a local log. This post shows how to read it, and what it can and can't prove.

## What gets recorded

Each call the agent's hook reports to OpenMoat becomes one event: the time, the agent, the session, the working directory, the tool, the action (a command, a file path, a URL, an MCP tool), the verdict, the rules that decided it and their reasons. Allowed calls are recorded as well as denied ones.

The log is a SQLite file in `~/.moat`. Credentials are redacted before anything is stored: a token in a command line, a `Bearer` header or a `password=` argument is masked, and so are the values of secrets you brokered with `openmoat secret add`. Nothing leaves your machine unless you export it.

## Reading it

Start with the plain command:

```bash
openmoat
```

```text
Protecting Claude Code (hook + OS sandbox) · today: 14 decisions, 1 denied, 1 asked
Claude Code asked to run "git config core.pager less" (rule git-internals, session 4f2a…)
Allow? [o]nce for this session / [a]lways / [n]o
```

It shows what needs you first, and says `Nothing needs you.` when nothing does.

For the decisions themselves:

```bash
openmoat show                     # recent events
openmoat show --since yesterday   # a window: today, yesterday, 12h, 7d, 2026-10-15 (UTC)
openmoat show 1                   # one event in full
```

```text
id     time (UTC) host         verdict rules          action
2      09:12:04   claude-code  defer   default        npm install left-pad
1      09:12:03   claude-code  deny    secrets-paths  cat ~/.ssh/id_rsa
```

These two examples are from OpenMoat's docs. A deny row tells you what was stopped. A defer row is a call the policy left to your agent's own prompt, so it ran if you or the agent's mode approved it.

When you want the story of one session rather than a list:

```bash
openmoat replay --since yesterday
```

This prints one tree per agent session, with every call, its verdict and the rule that decided it. Several agents, or several sessions of one agent, come out as separate trees.

For a summary over a longer window:

```bash
openmoat report --since 7d
```

It gives totals, the hosts the agents reached, the rules that fired most, and asks per active hour. If you are asked often, this shows which rule does it, so you know what to allow.

## The agent can't read or rewrite it

A log the agent can edit would not be worth much. The default policy denies the agent reads of the audit log, and opening it with a database shell counts as a write, which is denied too:

| The agent tries | Answer |
|---|---|
| `cat ~/.moat/audit.db` | deny, `kernel-self` |
| `sqlite3 ~/.moat/audit.db 'delete from events'` | deny, `kernel-self` |
| `openmoat audit anchor --git ~/notes` | deny, `kernel-self` |

The same rule, `kernel-self`, covers the agent's file tools: no writes into `~/.moat`, and no reads of the log, the lock or your approvals. The policy itself stays readable, so the agent can explain a deny. Under Claude Code's and Codex's OS sandboxes, commands the agent starts cannot change `~/.moat` either.

## Hash-chained, so changes show

Each event stores the hash of the event before it and a SHA-256 of its own contents. `openmoat doctor` re-hashes the whole log and reports the first event that was edited, deleted from the middle or moved, and exits with an error.

That makes the log tamper-evident. It is not tamper-proof. The chain is unkeyed and lives in the file it protects, so anyone who can write `~/.moat/audit.db`, which includes you and a program running as you outside any sandbox, can delete the newest events and leave a shorter chain that still checks out, or rewrite events and recompute every hash after them.

To catch that later, record the log's head somewhere else now and then:

```bash
openmoat audit anchor --git ~/notes          # a commit on refs/moat/anchors there; nothing is pushed
openmoat audit verify --against ~/notes      # later: fails, naming the anchor, if anchored events are gone
```

`--file ~/anchors.jsonl` appends a line to a file instead. An anchor is only as safe as the place you keep it: push the ref (`git -C ~/notes push origin refs/moat/anchors`) or copy the file to another machine. `openmoat doctor` shows when you last anchored. The agent cannot run `openmoat audit anchor` itself; that is the last row of the table above.

## Taking it somewhere else

To keep a week's events, or hand them to someone:

```bash
openmoat audit export --since 7d > week.jsonl   # events as JSON Lines, with their chain hashes
openmoat audit verify week.jsonl                # check it without the database
```

Without `--anchor <hash>`, the result says the export is not anchored. `--require-anchor` makes that a failure, for scripts. A team can collect each person's export and run one report over all of them with `openmoat audit report alice.jsonl bob.jsonl`; every file must verify first. Remove anything sensitive before you share an export: redaction masks known credential shapes, not everything private.

## Limits

- **The log records what the hook sees.** What a script does inside an allowed `npm test` is not in it; the OS sandbox bounds that, and OpenMoat does not see it call by call. Tools no hook exposes, such as Codex web search, are not recorded either.
- **A call that runs without the hook is not recorded.** Codex, and Claude Code before 2.1.295, run a call unchecked if the `openmoat` binary is missing; `openmoat status` reports it.
- **Tamper-evident, not tamper-proof.** Someone who can write the file can drop the newest events or rewrite and re-hash it. Only an anchor kept off the machine catches that, and events after the newest anchor are not covered.
- **A verified export is not a complete one.** `openmoat audit verify` shows that every line is the event its hash commits to. Dropped newest lines, or a deleted middle event, still verify without an anchor.
- **Redaction is by pattern and by brokered value.** A secret in a shape OpenMoat does not know can be stored as it was sent.

The full list is in the [threat model](https://github.com/crocodile-labs/openmoat/blob/main/docs/THREAT_MODEL.md).

## Try it

```bash
brew install crocodile-labs/tap/openmoat && openmoat init
```

Let your agent work as usual, then run `openmoat replay --since today`. The [guide to the log](/docs/see-what-happened/) has every command.
