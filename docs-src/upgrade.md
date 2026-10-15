---
title: Upgrade
nav: Upgrade
summary: Get a new release, then take what its default policy adds, without losing your own changes.
when: a new OpenMoat release is out, or `moat` says "policy update available".
---

:::steps
### Upgrade the binary

:::tabs
@tab Homebrew
```bash
brew update && brew upgrade moat
```
@tab Installer
Run the installer of the new release again, as in the [Quick start](quickstart.html).
@tab Cargo
```bash
cargo install openmoat --locked --force
```
:::

Hooks keep working after an upgrade in the same place. `moat doctor` confirms it.

### Take the new default rules, if you want them

Your policy is kept as it is, so a rule the new default gained is offered, not forced. `moat` says "policy update available: N changes" and offers to show them.

```bash
moat policy upgrade --dry-run   # what the new default adds, as a diff; changes nothing
moat policy upgrade             # shows the diff, asks, keeps a backup and re-pins
moat policy upgrade --undo      # put the previous policy back
```

Lines you changed are never touched.
:::

Every release and what changed in it: [Releases](https://github.com/crocodile-labs/openmoat/releases).
