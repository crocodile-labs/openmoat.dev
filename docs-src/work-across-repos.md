---
title: Work across several repos
nav: Work across several repos
summary: Let your agent read and edit folders outside the project it was started in.
when: the agent needs a sibling repository, a shared library, your notes or a docs folder, and you keep approving prompts for it.
---

Real work rarely stays in one repository. You start the agent in `app/`, and it needs `../shared-lib`, your notes, or the docs site next door. Outside the project OpenMoat has no rule, so every read and edit there goes to your agent's own prompt, and a shell command that writes there may fail inside the sandbox with `Operation not permitted`.

`moat allow --dir` makes such a folder part of your normal working area.

:::steps
### Allow the folder, in your own terminal

```bash
moat allow --dir ~/work/shared-lib
```

:::terminal
✔ added to /Users/you/.moat/policy.d/approved.yaml:
    - id: approved-1
      reason: approved with `moat allow --dir` on 2026-10-15 04:28:04 UTC
      fs.read:
      - /Users/you/work/shared-lib
      - /Users/you/work/shared-lib/**
      fs.write:
      - /Users/you/work/shared-lib
      - /Users/you/work/shared-lib/**
  deny rules still win: secrets and kernel files in it stay denied
  undo: moat allow --remove approved-1
✔ lock re-pinned (6 files)
:::

The agent can now read and edit files there without prompts.

### Update the sandbox if moat asks you to

```bash
moat status
```

If an agent's line says its sandbox **differs from the policy**, run:

```bash
moat sandbox sync
```

This writes the new folder into the agent's OS sandbox, so shell commands (`npm test`, `cargo build`) can use it too.

### Start a new agent session

The agent's sandbox settings are read when a session starts.
:::

## What changes

| The agent does, in `~/work/shared-lib` | Before | After |
|---|---|---|
| Reads or edits a file (`cat`, file tools) | your agent's prompt | allowed, no prompt |
| `echo x > notes.md` | your agent's prompt | allowed |
| `cat .env`, `cat config/.env.local` | denied | still denied |
| A write into `.git/hooks` | your agent's prompt | **allowed**, see below |
| `npm test` there | allowed command; the sandbox may block its writes | allowed, after `moat sandbox sync` |

:::impact
+ Every file in the folder and below: read, create, edit and delete
+ After `moat sandbox sync`, programs the agent runs can use it too
= `.env` files, keys and agent settings in it stay denied: deny rules win
= Home, a folder above it and `/` are refused: name the folder you work in
! The agent can edit build files there (`package.json` scripts, a `Makefile`, CI config) that you run later
! Writes into `.git` there do not ask first (see below)
:::

:::warning Git internals in an allowed folder
Inside the project, a write into `.git` (a hook, the config) asks you first, because git runs those later, outside any sandbox. Inside a folder you allowed with `--dir`, that write is currently allowed without the ask. Allow the folders you work in, not a parent that holds repositories you have not checked. A fix that keeps the ask is planned.
:::

:::tip Only reading?
If the agent only needs to read the other repository, a read-only rule is safer. Add it with `moat edit` ([Change the rules](change-the-rules.html)):

```yaml
allow:
  - id: shared-lib-read
    reason: reference code the agent may read
    fs.read: ["~/work/shared-lib/**"]
```
:::

## Undo it

```bash
moat allow --remove approved-1
```

Every rule `moat allow` added is in `~/.moat/policy.d/approved.yaml`, with its id.

## Several folders, or a pattern

Run `moat allow --dir` once per folder. For a pattern (every repository under `~/work/acme/`), or a read-only rule, edit the policy instead: see [Change the rules](change-the-rules.html).
