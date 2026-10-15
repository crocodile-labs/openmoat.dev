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

## What stays protected

- **Secrets in the folder stay denied.** `.env`, `.envrc`, keys and tokens there are still blocked: deny rules win over `allow --dir`.
- **OpenMoat's own files stay denied**, as do `~/.ssh`, `~/.aws` and the other secret locations.
- **It refuses folders that are too wide.** Your home directory, any folder above it and a filesystem root are refused: name the folder you work in.

:::warning Git internals in an allowed folder
Inside the project, a write into `.git` (a hook, the config) asks you first, because git runs those later, outside any sandbox. Inside a folder you allowed with `--dir`, that write is currently allowed without the ask. Allow the folders you work in, not a parent that holds repositories you have not checked. A fix that keeps the ask is planned.
:::

## Undo it

```bash
moat allow --remove approved-1
```

Every rule `moat allow` added is in `~/.moat/policy.d/approved.yaml`, with its id.

## Several folders, or a pattern

Run `moat allow --dir` once per folder. For a pattern (every repository under `~/work/acme/`), or a read-only rule, edit the policy instead: see [Change the rules](change-the-rules.html).
