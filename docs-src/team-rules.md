---
title: Share rules with your team
nav: Share rules with your team
summary: Commit rules to a repository so everyone who works there, with any agent, gets them.
when: your team wants the same guard rails in a repository, or a repository needs an allow everyone shares.
---

:::steps
### Add a policy to the repository

Create `.moat/policy.yaml` at the root of the repository and commit it:

```yaml
version: 1
deny:
  - id: no-prod-config
    reason: production settings stay with the release pipeline
    fs.write: ["${project}/deploy/prod/**"]
ask:
  - id: migrations
    reason: database migrations change shared data
    shell: ["npm run migrate*"]
```

### Everyone gets the deny and ask rules at once

They apply to everyone who works in the repository, whatever agent they use, and show up as `repo:<id>`, such as `repo:no-prod-config`.

### Each person trusts the allow rules

A repository is untrusted input, so by itself it can only make your policy stricter. Its `allow` rules apply after you review and trust that exact file:

```bash
moat trust             # in the repository; prints the allow rules it lets in
moat trust --revoke
```
:::

:::note
Any later change to the file drops it back to deny and ask only, until you trust it again. A file that does not parse denies every call in the project until it is fixed. Repository rules apply in the hook, not in the agents' OS sandboxes.
:::
