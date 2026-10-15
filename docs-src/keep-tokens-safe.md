---
title: Keep a token from the agent
nav: Keep a token from the agent
summary: The agent holds a placeholder; the real token goes only to the one host it belongs to. Here is exactly what the agent can and cannot see.
when: your agent needs an API token (GitHub, Stripe, an internal API) and you do not want it to be able to read or leak the value.
---

An agent that can read a token can send it anywhere a prompt injection tells it to. A **brokered secret** stays with OpenMoat: programs the agent runs hold a placeholder such as `moat-secret:gh:placeholder`, and the real value is put into requests to one host only.

## GitHub in one command

:::steps
### Add the secret, in your own terminal

```bash
moat secret add gh
```

It brokers `GITHUB_TOKEN` for `api.github.com`, shows the change to your policy, asks `Apply? [y/N]`, then updates the agent sandbox.

### Start the agent from a shell that has the token

The value is read from the environment the agent starts in:

```bash
export GITHUB_TOKEN="$(gh auth token)"   # in your terminal, not in the agent
claude
```

### Use GitHub from the agent

`gh` and other tools inside the agent see the placeholder in `GITHUB_TOKEN`, and their requests to `api.github.com` carry the real token.
:::

## Can the agent read the token?

| The agent tries | With `moat secret add gh` |
|---|---|
| `echo $GITHUB_TOKEN`, `printenv` | denied (`env-secrets`, `env-dump`) |
| `gh auth token`, `cat ~/.config/gh/hosts.yml` | denied (`secrets-paths`) |
| A program it runs reads `GITHUB_TOKEN` | gets the placeholder, not the value |
| Sends the placeholder to another host | worthless there: the value is put in only for `api.github.com` (through `moat proxy`, such a request is also refused) |

## Another service

Add the secret, and allow its host: a secret opens nothing by itself.

```bash
moat allow --site api.stripe.com
moat secret add stripe --host api.stripe.com --env STRIPE_API_KEY
```

The value goes in the `Authorization` header unless you pass `--header <name>`.

### Make sure the agent cannot read the source

`moat secret add` does not add a deny rule for where the value comes from. When nothing denies it, it warns: `no deny env.read rule covers …, so the agent can read it`. Check which case you are in:

| Source | Already denied? | If not |
|---|---|---|
| `--env NAME` ending in `_KEY`, `_TOKEN`, `_SECRET`, `_PASSWORD`, or starting with `AWS_` | yes, `env-secrets` | nothing to do |
| `--env NAME` with another name (`DATABASE_URL`, `STRIPE_LIVE`) | **no** | add an `env.read` deny with `moat edit` |
| `--file PATH` under `~/.ssh`, `~/.aws`, `~/.config/gh` and the other secret folders | yes, `secrets-paths` | nothing to do |
| `--file PATH` anywhere else (`~/.config/example/token`) | **no** | add an `fs.read` deny with `moat edit` |

For example, with `moat edit`:

```yaml
deny:
  - id: example-token
    reason: brokered secret source
    fs.read: ["~/.config/example/token"]
    env.read: ["DATABASE_URL"]
```

:::warning Prefer --env on macOS with Claude Code
Claude Code's broker reads `env` and `file` sources. On macOS it denies a `file` source to sandboxed commands instead of masking it, so the tool that reads that file cannot authenticate. Use `--env` there.
:::

## Where it works today

| Agent | HTTPS requests | Plain HTTP |
|---|---|---|
| Claude Code, sandboxed shell commands | yes: Claude Code's own sandbox broker puts the value in | yes, with `plain_http: true` in the policy |
| Codex, Cursor, `moat run` (through `moat proxy`) | not yet: the request keeps the placeholder and the server rejects it | yes, with `plain_http: true` |

:::impact
+ Programs the agent runs can call the API with your token
= The agent itself never holds the value, and cannot print or read it
= A request carrying the placeholder or the value to any other host is refused
! The API host can still be told to do anything the token allows: give the token the smallest scope that works
! Check the source is denied (table above), or the agent can read the value anyway
:::
