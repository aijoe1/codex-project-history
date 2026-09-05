# Contributing

Bug reports should include the operating system, VS Code version, Codex extension version, and
Codex Project History version. Redact chat titles, usernames, local paths, and private repository
names.

Before opening a pull request, run:

```bash
npm test
npm run check
```

Changes that read or write Codex state must remain read-only unless a separate design and security
review explicitly changes that boundary.
