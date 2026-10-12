# Current-project scope validation — 2026-10-12

Branch: `codex/current-project-scope` (proposed v0.3.0, not released).

## Proved

- `npm test`: 35/35 passed. The real SQLite fixture puts 350 newer chats in another project; the global 300-chat query misses the older current-project chats, while the scoped query returns the current root and worktree chats and excludes the archived row.
- `npm run check`, `npm run package:vsix`, `bash -n install-local.sh demo/setup-fixture.sh`, and `git diff --check` passed.
- A read-only query against the installed Codex state found 9 current-project chats in the Peptide Portal workspace with no foreign result or database diagnostic. Only counts were inspected for this validation.
- A fresh isolated VS Code 1.140.0 instance with its own user-data and extensions directories lists `aijoe1.codex-project-history@0.3.0` and official `openai.chatgpt@26.1007.21434`. Its extension-host log records Project Chats activation at 14:06:31 EDT with Codex as the dependency root cause, and no Project Chats activation error. The installed `extension.js` and `src/history.js` match the reviewed source byte-for-byte.
- The packaged runtime files match the reviewed source byte-for-byte. SHA-256 of `dist/codex-project-history-0.3.0.vsix`: `fe43ba8fb975b5547d78b7ff506652dbe1cb2e2f958f34918a41af32dc9df1b8`.

## Not proved / release gate

- The first development-path window detected the folder but never activated Project Chats. The owner reproduced the visible failure: no status-bar button and `command 'codexProjectHistory.open' not found` from the shortcut. Its logs confirm no Project Chats activation. The exact cause of that development-path failure is unproved; workspace trust and launch isolation are plausible factors. That window was closed, and the isolated installed-VSIX instance replaced it.
- Computer-use inspection still attaches to unrelated Code processes, so the new installed instance's picker, status-bar route, keyboard shortcut, modal warning, and reload have not yet been visually verified. Activation is not a substitute for that UI gate.
- Synthetic chats do not prove reopening real chats. The normal VS Code installation was not changed.
- No PR merge, GitHub release, Marketplace publication, dotfiles sync, or other-Mac installation occurred. Publish only after the isolated picker/reload gate passes and the exact public release is approved.
