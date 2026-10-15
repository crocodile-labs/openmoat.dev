---
title: Let the agent use a site
nav: Let the agent use a site
summary: Give the agent network access to one host the policy does not list, such as a docs site or an API.
when: a shell command like curl is denied with `default.net`.
---

Outbound network access from shell commands is denied by default: an unknown host is where a prompt injection would send your data. The default policy lists the hosts development needs (GitHub, npm, crates.io, PyPI, the Go proxy). Anything else is denied:

:::terminal
moat: deny [default.net] — no rule matched net docs.rs
:::

:::steps
### Allow the host, in your own terminal

```bash
moat allow --site docs.rs
```

:::terminal
✔ added to /Users/you/.moat/policy.d/approved.yaml:
    - id: approved-2
      reason: approved with `moat allow --site` on 2026-10-15 09:12:04 UTC
      net:
      - docs.rs
  undo: moat allow --remove approved-2
✔ lock re-pinned (6 files)
:::

It also updates your agents' OS sandboxes, so sandboxed commands can reach the host too.

### Start a new agent session, or ask the agent to try again

Fetch tools see the change at once; sandboxed shell commands after a new session.
:::

## What changes

| The agent uses | Before | After |
|---|---|---|
| A web fetch tool (Claude Code `WebFetch`) on `docs.rs` | your agent's prompt | **allowed**, no prompt |
| `curl https://docs.rs/serde` | denied | your agent's prompt, like any command the policy does not list |
| `curl https://www.docs.rs/` | denied | still denied: another host |

:::impact
+ Requests to exactly `docs.rs`, from fetch tools and from shell commands
+ Sandboxed commands may connect to it
= Every other host stays denied, subdomains included
= Secrets are still denied, so the agent cannot read a key to send there
! The host can receive whatever the agent sends it. Never allow paste sites, webhook catchers or file-sharing hosts
! OpenMoat checks the host, not the data inside HTTPS
:::

## Good to know

- **One exact host.** Wildcards, URLs and ports are refused here; write those with `moat edit` ([Change the rules](change-the-rules.html)).
- **Already allowed:** `github.com`, `api.github.com`, `registry.npmjs.org`, `crates.io`, `static.crates.io`, `index.crates.io`, `proxy.golang.org`, `pypi.org`, `files.pythonhosted.org`.

## Undo it

```bash
moat allow --remove approved-2
```
