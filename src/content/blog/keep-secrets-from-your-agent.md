---
title: Keep .env files and API tokens away from your AI agent
description: An agent that can read a token can send it anywhere. How OpenMoat keeps secrets out of reach, and how the agent can still use an API without ever holding the token.
summary: Which secrets the agent can never read, the ones it can, and how a brokered token lets it call an API with a placeholder instead of the real value.
date: 2026-10-15T11:00:00Z
author: Dhanasekaran Kathiresan
authorUrl: https://github.com/iamdotk
avatar: /assets/dhanasekaran.jpg
tag: guide
minutes: 6
tags: ["Guide", "Secrets"]
cover: "echo $GITHUB_TOKEN"
coverResult: "⛔ deny  env-secrets"
coverTone: deny
---

Your project has a `.env` file. Your shell has `GITHUB_TOKEN` exported. Your home directory has SSH keys and cloud credentials. Your coding agent runs with your permissions, so by default it can read all of it.

That matters because an agent reads text that strangers wrote. If an issue or a web page tells it to print your token and paste it somewhere, the agent can do that in one command. A secret the agent can read is a secret a prompt injection can send.

I build OpenMoat, and this post shows how it keeps secrets out of the agent's reach, which ones it cannot protect on its own, and how an agent can still use an API without ever holding the token.

## What the agent can never read

These are denied by the default policy. The agent is told which rule stopped it:

| The agent tries | Answer |
|---|---|
| `cat .env`, `source .env`, `cat config/.env.local` | deny, `secrets-paths` (any `.env` or `.env.*`, at any depth) |
| `cat .envrc` | deny |
| `cat ~/.ssh/id_rsa`, `cat ~/.aws/credentials` | deny, `secrets-paths` |
| `echo $OPENAI_API_KEY`, `echo $GITHUB_TOKEN` | deny, `env-secrets` |
| `printenv`, `env`, `cat /proc/self/environ` | deny, `env-dump` |
| `gh auth token`, `security find-generic-password -w` | deny, `secrets-paths` |

Committed templates stay readable: `.env.example`, `.env.sample` and `.env.template` carry no values, so the agent can still see which variables your project needs.

The same rules apply to the agent's file tools, not only the shell. A `Read` of `~/.aws/credentials` is denied like a `cat`.

## The programs the agent runs

The agent's own commands are only half of it. When the agent runs `npm test`, the test script runs with your permissions too, and OpenMoat's hook does not see what it does.

So the same policy also configures the agent's OS sandbox. A script that tries to read your SSH key or AWS credentials fails at the operating system. These results come from CI, for a test script started as `npm test` with fake secrets:

| What the script does | Claude Code sandbox, macOS | Codex `moat` profile, Linux |
|---|---|---|
| `cat "$HOME/.ssh/id_rsa"` | EPERM | EACCES |
| `cat "$HOME/.aws/credentials"` | EPERM | EACCES |
| `cat .env` | EPERM | EACCES |

Every layer is in [EVIDENCE.md](https://github.com/crocodile-labs/openmoat/blob/main/docs/EVIDENCE.md), with the gaps.

One thing to know before you try it: because the sandbox comes from the same policy, a test that loads `.env` or `.env.test` gets no values when the agent runs it. Keep values that are not secret in a file not named `.env*`, like `config/test.json`, and run tests that need real secrets yourself.

## Secrets with names that do not say so

OpenMoat denies variable names that look like secrets: anything ending in `_KEY`, `_TOKEN`, `_SECRET` or `_PASSWORD`, anything starting with `AWS_`, and a few known names like `GITHUB_TOKEN` and `NPM_TOKEN`.

`DATABASE_URL` often holds a password too, but its name does not say so. `echo $DATABASE_URL` goes to your agent's prompt. Deny it yourself with `openmoat edit`, which shows the diff before it applies:

```yaml
deny:
  - id: my-secret-vars
    reason: these hold credentials
    env.read: ["DATABASE_URL", "REDIS_URL", "SENTRY_DSN"]
```

## When the agent needs the token

Denying every read works until the agent needs to call an API. It has to open a pull request, or read an issue, and the API wants a token.

That is what the secrets broker is for. You keep the token. The agent gets a placeholder:

```bash
openmoat secret add gh
```

Run this in your own terminal. The agent is denied `openmoat secret` commands. It brokers `GITHUB_TOKEN` for `api.github.com`, shows the change to your policy and asks before it applies. Then start the agent from a shell that has the token:

```bash
export GITHUB_TOKEN="$(gh auth token)"   # in your terminal, not in the agent
claude
```

Now `gh` and other tools inside the agent see a placeholder like `moat-secret:gh:placeholder` in `GITHUB_TOKEN`. Their requests to `api.github.com` carry the real token. Here is what the agent can do with it:

| The agent tries | Result |
|---|---|
| `echo $GITHUB_TOKEN`, `printenv` | denied |
| `gh auth token`, `cat ~/.config/gh/hosts.yml` | denied |
| A program it runs reads `GITHUB_TOKEN` | gets the placeholder |
| Sends the placeholder to another host | worthless there; the value is only added for `api.github.com` |

`openmoat secret add` also checks where the value comes from. If the agent could read the source anyway, it adds a deny rule for it, in the same diff you approve.

For another service, allow its host and name the variable:

```bash
openmoat allow --site api.stripe.com
openmoat secret add stripe --host api.stripe.com --env STRIPE_API_KEY
```

## Limits

- **Where the broker works.** In Claude Code, the value goes into HTTPS requests through Claude Code's own sandbox broker. Through `openmoat proxy` (Codex, Cursor, `openmoat run`) it goes only into plain-HTTP requests for now. HTTPS requests there keep the placeholder, and the server rejects them.
- **Variables you export reach the programs the agent runs.** The agent cannot print a denied name, but a test or CLI it starts can use the value and send it to an allowed host. Do not export production secrets in the shell you start an agent from, or broker them.
- **The API host can still be told to do anything the token allows.** Give the token the smallest scope that works.
- **On Linux,** plain `openmoat run` cannot protect `.env` inside the project; `openmoat run --isolate` does.
- **If the `openmoat` binary is missing,** Claude Code and Codex run calls unchecked. `openmoat status` reports it.

The full list is in the [threat model](https://github.com/crocodile-labs/openmoat/blob/main/docs/THREAT_MODEL.md).

## Try it

```bash
brew install crocodile-labs/tap/openmoat && openmoat init
```

Then check one of your own files without reading it: `openmoat policy check "cat .env"`. The [token guide](/docs/keep-tokens-safe/) and the [.env guide](/docs/env-files/) have every case.
