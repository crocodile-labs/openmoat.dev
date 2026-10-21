---
title: One set of rules for Claude Code, Codex and Cursor on your team
description: Every agent has its own settings format, and every developer configures it differently. How to commit one policy to a repository, what a repository may and may not change, and how to check what the agents did.
summary: Your team uses three agents with three settings formats. How a committed .moat/policy.yaml gives everyone the same deny and ask rules, why its allow rules need trust, and how to verify the audit log.
date: 2026-10-15T13:00:00Z
author: Dhanasekaran Kathiresan
authorUrl: https://github.com/iamdotk
avatar: /assets/dhanasekaran.jpg
tag: guide
minutes: 6
tags: ["Guide", "Teams", "Policy"]
cover: "git add .moat/policy.yaml"
coverResult: "one policy · Claude Code · Codex · Cursor"
coverTone: ok
---

On most teams, people do not use the same coding agent. One developer uses Claude Code, another Codex, a third Cursor. Each agent has its own permission settings, in its own format, in each person's home directory.

So when the team agrees that "agents never touch the production deploy config", there is no single place to write that down. You write it three times, in three formats, on every machine, and hope nobody's copy drifts.

I build OpenMoat. This post shows how one file in the repository gives everyone the same rules, whatever agent they use, and what that file is not allowed to do.

## One policy, three agents

OpenMoat checks each agent's actions through its hooks, against one policy in one format. Your own policy lives in `~/.moat/policy.yaml`. A repository can add its own in `.moat/policy.yaml` at its root:

```yaml
version: 1
deny:
  - id: no-prod-config
    reason: production settings stay with the release pipeline
    fs.write: ["${project}/deploy/prod/**"]
ask:
  - id: migrations
    reason: database migrations change shared data
    shell: ["npm run migrate*"]
```

Commit it. From then on, everyone who works in the repository gets those rules, whether their agent is Claude Code, Codex or Cursor. A blocked call shows the rule as `repo:<id>`, so the developer sees it came from the repository:

```text
moat: deny [repo:no-prod-config] — production settings stay with the release pipeline
```

The `reason` is what the agent and the developer read. Write it for them.

## A repository can only make things stricter

There is a catch, and it is on purpose. A repository is untrusted input. You clone strangers' code, and a pull request can change any file in it. If a committed policy could allow things, a malicious repository could ship a `.moat/policy.yaml` that allows reading your SSH key.

So on its own, a repository policy adds only deny and ask rules. Its `allow` rules apply only after a person reviews and trusts that exact file, in that checkout:

```bash
openmoat trust             # in the repository; prints the allow rules it lets in
openmoat trust --revoke    # take it back
```

Any later change to the file drops it back to deny and ask only, until you trust it again. A pull request that quietly adds an allow rule does nothing until someone looks at it.

Two more safety rules:

- A repository policy that does not parse denies every call in the project until it is fixed. A broken file never fails open.
- Defaults, executables and sandbox settings stay in each person's own policy. A repository policy that tries to set them also denies every call in the project.

## Test the policy like code

A policy is a file in your repository, so you can test it in CI. `openmoat policy check` shows the verdict for a command against a given policy, without running it:

```bash
openmoat policy lint ./.moat/policy.yaml
openmoat policy check "npm run migrate:up" --policy ./.moat/policy.yaml --project .
```

That gives a reviewer a way to see what a policy change does before it merges.

## See what the agents did

Rules are half of it. The other half is knowing what happened. Every decision goes into a local audit log that detects tampering:

```bash
openmoat report --since 7d       # totals, hosts, top rules
openmoat replay --since today    # a timeline per session
```

For a team, each person can export their log, and anyone can verify it without access to their machine:

```bash
openmoat audit export --since 7d > alice.jsonl
openmoat audit verify alice.jsonl
openmoat audit report alice.jsonl bob.jsonl
```

The export carries chain hashes, so an edited or deleted event shows up when it is verified. Credentials are redacted before they are stored, and nothing leaves a machine unless the person exports it.

## Limits

- **Repository rules apply in the hook, not in the agents' OS sandboxes.** A repo deny stops the agent's own calls. It does not stop a script that an allowed command starts.
- **Each developer runs OpenMoat on their own machine.** There is no central server that pushes policy to everyone. A teammate who has not run `openmoat init` is not protected by the repository's rules.
- **Agents differ.** Codex cannot show an OpenMoat prompt, so an ask becomes a deny that the developer approves with `openmoat allow --last`. Cursor asks only for shell and MCP calls.
- **A deferred call runs if the agent lets it.** In auto-approve modes, only deny and ask rules stop a call, which is a good reason to write the rules your team cares about as deny or ask.

The full list is in the [threat model](https://github.com/crocodile-labs/openmoat/blob/main/docs/THREAT_MODEL.md).

## Try it

```bash
brew install crocodile-labs/tap/openmoat && openmoat init
```

Then add one deny rule your team already agrees on to `.moat/policy.yaml`, and commit it. The [team rules guide](/docs/team-rules/) has the details. If your team needs something this does not do, tell me on [GitHub](https://github.com/crocodile-labs/openmoat/issues): features for teams are on the [roadmap](https://github.com/crocodile-labs/openmoat/blob/main/docs/ROADMAP.md), and that feedback shapes them.
