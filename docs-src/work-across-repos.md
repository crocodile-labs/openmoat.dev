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
      …
  deny rules still win: secrets and kernel files in it stay denied
  undo: moat allow --remove approved-1
✔ lock re-pinned (6 files)
Updating the agents' sandbox settings:
✔ Claude Code      /Users/you/.claude/settings.json (sandbox updated)
…
:::

The rule leaves out writes into a `.git` there and the files CI or a commit hook runs later (the `…` above). It also updates your agents' OS sandboxes, so shell commands (`npm test`, `cargo build`) can use the folder too.

### Start a new agent session

The agent's sandbox settings are read when a session starts.
:::

## What changes

| The agent does, in `~/work/shared-lib` | Before | After |
|---|---|---|
| Reads or edits a file (`cat`, file tools) | your agent's prompt | allowed, no prompt |
| `echo x > notes.md` | your agent's prompt | allowed |
| `cat .env`, `cat config/.env.local` | denied | still denied |
| A write into `.git/hooks` or `.git/config` | your agent's prompt | still your agent's prompt |
| A write to `.github/workflows/ci.yml` or `.husky/pre-commit` | asks (`runs-later`) | still asks |
| `npm test` there | allowed command; the sandbox may block its writes | allowed |

:::impact
+ Every file in the folder and below: read, create, edit and delete
+ Programs the agent runs can use it too
= `.env` files, keys and agent settings in it stay denied: deny rules win
= Writes into `.git`, CI workflows and commit-hook files are not allowed by it
= Home, a folder above it and `/` are refused: name the folder you work in
! The agent can still edit build files there (`package.json` scripts, a `Makefile`) that you run later: check `git diff` before you run or push
:::

:::note Added with OpenMoat 0.5.1 or earlier?
A rule from an earlier version does not leave out `.git` and the files run later. Remove it and add the folder again: `moat allow --remove approved-1`, then `moat allow --dir <folder>`.
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

Run `moat allow --dir` once per folder. Allow the folders you work in, not a parent that holds repositories you have not checked. For a pattern (every repository under `~/work/acme/`), or a read-only rule, edit the policy instead: see [Change the rules](change-the-rules.html).
