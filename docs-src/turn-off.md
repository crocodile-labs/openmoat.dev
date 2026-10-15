---
title: Turn it off
nav: Turn it off
summary: Remove OpenMoat from one agent or all of them, and put every settings file back as it was.
when: you need OpenMoat out of the way right now, or you are removing it.
---

```bash
moat uninstall
```

It takes OpenMoat out of every agent it set up and restores each settings file from the backup `moat init` made. Restart the agents afterwards.

| You want | Run |
|---|---|
| Remove it from every agent | `moat uninstall` |
| Remove it from one agent | `moat uninstall --hosts claude-code` |
| Also delete the policy and the audit log | `moat uninstall --purge` |
| Set it up again later | `moat init` |

Without `--purge`, your policy and log stay in `~/.moat`.

:::note Run it yourself
`moat uninstall` needs a terminal, and the default policy denies it to agents: a prompt injection cannot switch OpenMoat off.
:::

To remove the binary as well: `brew uninstall moat`, or delete `~/.cargo/bin/moat` if you used the installer.
