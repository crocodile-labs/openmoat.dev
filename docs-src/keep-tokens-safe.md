---
title: Keep a token from the agent
nav: Keep a token from the agent
summary: The agent holds a placeholder; the real token goes only to the one host it belongs to.
when: your agent needs an API token (GitHub, a cloud API) and you do not want it to be able to read or leak the value.
---

An agent that can read a token can send it anywhere. With a brokered secret the agent never sees the value: it holds a placeholder such as `moat-secret:gh:placeholder`, and the real token is put into requests to one host only. A request that carries the placeholder or the value to any other host is refused.

:::steps
### Add the secret, in your own terminal

For GitHub, one command:

```bash
moat secret add gh
```

It brokers `GITHUB_TOKEN` for `api.github.com`, shows the change to your policy and asks before writing it, then updates the agent sandbox.

### Start a new agent session

The agent's tools now see the placeholder in `GITHUB_TOKEN`.
:::

## Another service

```bash
moat secret add stripe --host api.stripe.com --env STRIPE_API_KEY
moat secret add internal --host api.example.com --file ~/.config/example/token
```

The value goes into the `Authorization` header unless you pass `--header <name>`. The host also needs to be allowed for network access ([Let the agent use a site](allow-a-site.html)); a secret opens nothing by itself.

## Where it works today

| Agent | HTTPS requests | Plain HTTP |
|---|---|---|
| Claude Code, sandboxed shell commands | Yes: Claude Code's own sandbox broker puts the value in | Yes, with `plain_http: true` |
| Codex, Cursor, `moat run` (through `moat proxy`) | Not yet: the request keeps the placeholder and the server rejects it | Yes, with `plain_http: true` |

:::note
In every case the agent itself never holds the value, and a request carrying it to another host is refused. Reading the token any other way (`echo $GITHUB_TOKEN`, `gh auth token`, `cat ~/.config/gh/hosts.yml`) is denied by the default policy.
:::
