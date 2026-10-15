---
title: Something was blocked
nav: Something was blocked
summary: What each message means, and the one command that gets you moving again.
when: your agent says a call was denied or asked, or you keep seeing a prompt you do not want.
---

Find the message you saw, then run the command next to it **in your own terminal**. Agents are denied every one of these commands, so a prompt injection cannot run them for you.

| You saw | It means | Run |
|---|---|---|
| `moat: deny [default.net] — no rule matched net docs.rs` | A host the policy does not list. | `moat allow --site docs.rs` |
| `moat: ask [git-internals] — …` | A call whose effect outlives the session. | Approve it in the prompt, or `moat allow --last` |
| Your agent's own prompt, for a file outside the project | OpenMoat has no rule for it and left it to your agent. | `moat allow --dir <folder>`, see [Work across several repos](work-across-repos.html) |
| `moat: deny [secrets-paths] — secret material: read …` | A key, token or `.env`. This is the block working. | Nothing. If the agent needs a token, see [Keep a token from the agent](keep-tokens-safe.html) |
| `moat: deny [kernel-integrity] — … was modified` | A pinned file (the policy, a hook) changed. Every call is blocked until you look. | `moat`, see [Troubleshooting](troubleshooting.html) |

## An ask you want to approve

:::steps
### Approve it once

Answer the prompt, or run:

```bash
moat allow --last            # the last ask: allowed for the rest of that agent session
```

:::terminal
last ask: 41 on claude-code (session 4f2a…) wanted to run "git config core.pager less"
✔ session 4f2a… on claude-code may run "git config core.pager less" for 24h
  only in this agent session: a new session asks again (`claude --continue` resumes this one)
✔ lock re-pinned (6 files)
:::

A session grant lasts 24 hours and covers only that session and that exact command or file.

### Or allow it for good

```bash
moat allow --last --always   # a permanent rule in ~/.moat/policy.d/approved.yaml
```

It prints what the rule will match before writing it, and the command that undoes it. A command rule also matches the same command with more arguments: [what each allow opens](allow-reference.html).
:::

:::note Codex and Cursor file tools
Codex, and Cursor for file tools, cannot show a prompt. There an ask becomes a deny whose message says to run `moat` or `moat allow --last`. Run it, then ask the agent to retry.
:::

## A deny you think is wrong

A deny rule cannot be allowed away: that is what makes it safe. If the default policy blocks something normal work needs, it is a false positive:

1. Check what the policy says: `moat policy check "<the command>"`.
2. Report it with the **False positive** template on [GitHub](https://github.com/crocodile-labs/openmoat/issues/new/choose), so the default stops doing it for everyone.
3. If you cannot wait, change the rule yourself with `moat edit` ([Change the rules](change-the-rules.html)).

## Many prompts while you work

If you keep answering your agent's prompt for the same kind of call, OpenMoat is not the one asking: those calls defer. Two commands stop them for good:

```bash
moat allow --dir ~/work/shared     # read and write in that folder
moat allow --site docs.rs          # network access to that host
```

`moat` alone shows today's decisions, so you can see which calls deferred, asked or were denied.
