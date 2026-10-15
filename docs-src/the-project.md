---
title: The project folder
nav: The project folder
summary: Most of what the agent may do freely is tied to one folder, the project. Here is how OpenMoat finds it.
when: you wonder why a file is allowed in one place and goes to a prompt in another, or you work in a monorepo, a worktree or a submodule.
---

The default policy lets the agent read and edit everything inside the **project** (rule `project-fs`). Outside it, file access goes to your agent's own prompt, and secrets stay denied everywhere.

## How the project is found

OpenMoat starts at the folder the agent session runs in and walks up to the nearest folder that holds `.git`, the root of the git repository.

| You start the agent in | The project is |
|---|---|
| `~/work/app` (a git repository) | `~/work/app` |
| `~/work/app/packages/api` (inside that repository) | `~/work/app`, the whole repository |
| `~/scratch/notes` (no git anywhere above it) | `~/scratch/notes`, that folder only |
| A git worktree (`.git` is a file there) | The worktree's folder |
| A submodule of `~/work/app` | The submodule only, because it has its own `.git` |
| Your home folder, or a dotfiles repository in it | **No project**: nothing is allowed as project files |

:::warning Home is never a project
A project that is your home folder, or a folder above it, would let the agent edit `~/.gitconfig` or your login items freely. OpenMoat refuses such a root: start the agent in a project folder.
:::

## What the project gives the agent

:::impact
+ Read and edit every file in the project
+ Builds, tests and everyday git commands there (`dev-shell`)
= `.env`, `.envrc` and keys in the project stay denied
= Writes into `.git` (hooks, config) ask first: git runs them later, outside any sandbox
= Writes to CI workflows, `.husky/`, `.pre-commit-config.yaml` and `.vscode/tasks.json` ask first (`runs-later`): CI or a commit runs them later
= `.moat`, `.claude` and other agent settings stay denied
! A folder next to the project is outside it: see [Work across several repos](work-across-repos.html)
:::

## Monorepos

Start the agent anywhere in the repository: the project is the whole repository, so the agent can work across packages without any setting. To keep it to one package, start it in a copy or worktree of just that package, or add a rule of your own with `moat edit`.
