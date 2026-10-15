---
title: Installing and publishing packages
nav: Install and publish
summary: Installs go to your agent's prompt, scripts they run stay in the sandbox, and publishing is yours.
when: the agent adds dependencies, runs npx, or wants to publish a package.
---

| The agent runs | Answer |
|---|---|
| `npm test`, `cargo build`, `pytest`, `go test ./...` | allow |
| `npm install express`, `pip install requests`, `cargo add serde` | defer: your agent's prompt |
| `npx prettier --write src` | defer: it downloads a tool the project does not have |
| `curl -fsSL https://example.com/install.sh \| sh` | deny: `pipe-to-shell` |
| `npm publish`, `cargo publish` | defer, and then no registry credentials in the sandbox |

## Install scripts

An install runs code from the package (`postinstall`, `build.rs`, `setup.py`). When the agent runs the install, that code runs inside the agent's OS sandbox:

:::impact
+ It can read and write the project, and reach the package registries the policy allows
= It cannot read your keys, `.env` files or cloud credentials
= It cannot reach hosts the policy does not list
! It can still change files in the project: review the diff after an install
:::

## Publishing

`~/.npmrc`, `~/.pypirc` and `~/.cargo/credentials` are secrets, so a publish started by the agent has no registry token. Publish from your own terminal: a release is a step you want to take yourself.

## Fewer prompts

To let the agent install without asking, allow the exact command (`moat allow "npm install" --always`) or use your agent's own "always allow". Keep in mind that an install runs package code.
