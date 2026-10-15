---
title: Check a command first
nav: Check a command first
summary: Get the verdict for any command, file or URL without running it.
when: you want to know whether a command will be blocked, or why it was.
---

```bash
moat policy check "git push origin main"
```

:::terminal
→ defer
   rules : default
   reason: no rule matched shell "git push origin main"
:::

`moat policy check` runs nothing. It parses the command the way the hook does and prints the answer, the rules that decided it and the reason.

## More examples

```bash
moat policy check "cat ~/.ssh/id_rsa"                      # deny: secrets-paths
moat policy check "git config core.hooksPath .h"           # ask: git-internals
moat policy check "https://docs.rs/serde" --kind fetch     # a web fetch, not a shell command
moat policy check "~/.aws/credentials" --kind fs-read      # a file read by a file tool
```

## Use it in scripts

The exit code is the answer:

| Exit code | Answer |
|---|---|
| `0` | allow or defer |
| `2` | deny |
| `3` | ask |
| `64` | a usage or configuration error |
