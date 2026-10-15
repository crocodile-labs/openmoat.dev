---
title: Quick start
nav: Quick start
summary: Install OpenMoat, protect your agents, and check that it works.
when: you are setting OpenMoat up for the first time on a machine.
---

:::steps
### Install moat

:::tabs
@tab Homebrew
macOS and Linux.

```bash
brew install crocodile-labs/tap/moat
```
@tab Installer
macOS and Linux; puts `moat` in `~/.cargo/bin`.

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/crocodile-labs/openmoat/releases/latest/download/openmoat-installer.sh | sh
```
@tab Windows
PowerShell.

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/crocodile-labs/openmoat/releases/latest/download/openmoat-installer.ps1 | iex"
```
@tab Cargo
From crates.io, with Rust 1.95.

```bash
cargo install openmoat --locked
```
:::

### Set it up for your agents

```bash
moat init
```

`moat init` writes the default policy to `~/.moat`, then lists the agents it finds and asks once for each:

:::terminal
Found these agents:
  Claude Code  /Users/you/.claude (changes settings.json)
  Codex        /Users/you/.codex (changes hooks.json, config.toml)
Protect Claude Code (/Users/you/.claude)? [Y/n]
Protect Codex (/Users/you/.codex)? [Y/n]
:::

It backs up every file before it changes it. `moat uninstall` puts them all back.

### Start your agent in a new session

Hooks are read when a session starts, so open a new one. Then work as usual: most calls run exactly as before.

### Check that it works

```bash
moat status                            # each agent: hook + OS sandbox, hook only, or not protected
moat policy check "cat ~/.ssh/id_rsa"  # the verdict for a command, without running it
```

:::terminal
⛔ deny
   rules : secrets-paths
   reason: secret material: read /Users/you/.ssh/id_rsa
   also  : shell "cat ~/.ssh/id_rsa"
:::
:::

## What next

:::cards
- [How it decides](how-it-decides.html) Why some calls run, some go to your agent's prompt and a few are blocked.
- [Something was blocked](blocked.html) What to do when a block gets in your way.
- [Work across several repos](work-across-repos.html) The first thing most developers need.
:::

:::tip Run `moat` anytime
`moat` alone shows which agents are protected, today's decisions, and anything that needs you, such as a pending ask.
:::
