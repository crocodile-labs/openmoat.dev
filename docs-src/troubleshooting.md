---
title: Troubleshooting
nav: Troubleshooting
summary: Fixes for the problems people hit, from the most common.
when: something about OpenMoat itself is not working.
---

## Every call is denied with `kernel-integrity`

:::terminal
moat: deny [kernel-integrity] — /Users/you/.moat/policy.yaml was modified;
      run `moat doctor` to inspect; `moat doctor --accept` or `moat init` to re-pin
:::

A pinned file (the policy, a hook, an agent's settings) changed without you accepting it. Run `moat`: it shows the change and asks whether to accept it. If you did not make the change, you caught what OpenMoat exists for: look at `moat doctor` before accepting.

## An agent shows "hook only" or "not protected"

```bash
moat status
```

| It says | Run |
|---|---|
| `not protected: hook missing` | `moat init` |
| sandbox `differs from the policy` | `moat sandbox sync`, then start a new agent session |
| `hook only` on native Windows | Expected: use WSL2 for the OS sandbox |

## Nothing seems to happen

Hooks are read when a session starts. Start a new agent session after `moat init`, and check `moat status`.

## The `moat` binary is missing or broken

Claude Code and Codex then run calls without the check, and Cursor blocks them. Reinstall it (`brew reinstall crocodile-labs/tap/moat`, or the installer), then run `moat status`.

## A command you need is blocked

See [Something was blocked](blocked.html). If the default policy is wrong, please report a **False positive** on [GitHub](https://github.com/crocodile-labs/openmoat/issues/new/choose).

## Found a way past OpenMoat?

Please report it privately, as described in [SECURITY.md](https://github.com/crocodile-labs/openmoat/blob/main/SECURITY.md). Valid bypasses become tests before the fix is published.
