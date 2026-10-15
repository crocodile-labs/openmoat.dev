---
title: Let the agent use a site
nav: Let the agent use a site
summary: Give the agent network access to one host the policy does not list, such as a docs site or an API.
when: a command like curl or a package tool is denied with `default.net`.
---

Outbound network access is denied by default: an unknown host is where a prompt injection would send your data. The default policy lists the hosts development needs (GitHub, npm, crates.io, PyPI, the Go proxy). Anything else is denied for shell commands:

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

### Update the sandbox if moat asks you to

Run `moat status`. If an agent's sandbox **differs from the policy**, run `moat sandbox sync` and start a new agent session, so sandboxed shell commands can reach the host too.

### Ask the agent to try again

The agent can now reach `docs.rs`, with shell commands and web fetches.
:::

## Good to know

- **One exact host.** `docs.rs` does not cover `www.docs.rs` or `api.docs.rs`; allow each one. Wildcards, URLs and ports are refused here: write those with `moat edit` ([Change the rules](change-the-rules.html)).
- **Web fetch tools are not denied.** A Claude Code `WebFetch` of an unlisted site goes to Claude Code's own prompt instead, because a fetch tool cannot send a request body. `curl` can, so it is denied.
- **Allowed hosts can still receive data.** OpenMoat checks the host, not what is sent to it. Allow hosts you trust.

## Undo it

```bash
moat allow --remove approved-2
```
