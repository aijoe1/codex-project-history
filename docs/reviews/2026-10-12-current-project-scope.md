# Current-project scope validation — 2026-10-12

Branch: `codex/current-project-scope` (proposed v0.3.0, not released).

## Proved

- `npm test`: 35/35 passed. The real SQLite fixture puts 350 newer chats in another project; the global 300-chat query misses the older current-project chats, while the scoped query returns the current root and worktree chats and excludes the archived row.
- `npm run check`, `npm run package:vsix`, `bash -n install-local.sh demo/setup-fixture.sh`, and `git diff --check` passed.
- A read-only query against the installed Codex state found 9 current-project chats in the Peptide Portal workspace with no foreign result or database diagnostic. Only counts were inspected for this validation.
- Isolated VS Code 1.140.0 loaded the development extension; its extension-host log records `aijoe1.codex-project-history` activation at 13:58:51 EDT. No Project Chats activation error appears in that log. Other installed extensions reported unrelated compatibility/deprecation warnings.
- The packaged runtime files match the reviewed source byte-for-byte. SHA-256 of `dist/codex-project-history-0.3.0.vsix`: `fe43ba8fb975b5547d78b7ff506652dbe1cb2e2f958f34918a41af32dc9df1b8`.

## Not proved / release gate

- The isolated VS Code process ran with a synthetic Codex fixture, but computer-use inspection attached to another Code process, so the new picker, status-bar route, keyboard shortcut, modal warning, and reload were not visually verified. Do not describe this as an isolated UI pass.
- Synthetic chats do not prove reopening real chats. The normal VS Code installation was not changed.
- No PR merge, GitHub release, Marketplace publication, dotfiles sync, or other-Mac installation occurred. Publish only after the isolated picker/reload gate passes and the exact public release is approved.
