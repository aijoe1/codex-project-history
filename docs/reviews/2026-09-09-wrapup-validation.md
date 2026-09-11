# Wrapup reconciliation validation — September 9, 2026

Scope: finish the previously interrupted close-out, review the pending demo-only script/test
changes, and reconcile historical launch records. No extension-runtime API changes, installation,
publication, push, release replacement, or new social replies.

## Results

- Existing-file apply_patch succeeded on DECISIONS.md; read back with Git diff. Subsequent
  existing-file record updates also succeeded. No binary replacement or permission change.
- `npm test`: 25 passed, zero failures or skips.
- `npm run check`: passed.
- `bash -n install-local.sh demo/setup-fixture.sh`: passed.
- `git diff --check`: passed before close-out.
- Ran the actual `bash demo/setup-fixture.sh` using the installed official Codex runtime,
  not the fake runtime used in the automated test. It initialized a fresh disposable database.
- Independent `/usr/bin/sqlite3 -readonly` query found exactly 3 threads and 2 repository origins.
- Smoke command with explicit disposable CODEX_HOME and CODEX_SQLITE_HOME returned 3 chats,
  2 project groups, current workspace first, and no diagnostics. An earlier smoke invocation
  omitted the environment overrides and read the normal local metadata; that output was not
  saved into this repository or used as fixture proof. No history was modified.
- Final approved video SHA-256 still matches the launch receipt:
  `894e6e9a4aba4e64e8cb930670d9f473b5bec2042b532568d486f64071364600`.

## Review and limits

The pending code change only gives the demo an isolated short VS Code user-data directory and
prints the corresponding launch/cleanup instructions. The test covers the printed isolation
flags with a deterministic override. Runtime extension code is unchanged. The default root is
created with mktemp under /tmp; the explicit override refuses a pre-existing target.

This rerun proves real-runtime fixture creation and metadata grouping, not a new VS Code
activation/reload or chat-reopening test. Earlier owner acceptance remains owner-reported.
No editor was launched for this validation. The earlier native-window transition attempt failed;
a fresh chat was not created, and editing subsequently succeeded in the existing session.

Historical research is preserved with its original observation dates, not presented as a fresh
web survey. Published launch receipts supersede the original draft gates. Owner-reported reply
is recorded without claiming independent readback. Reddit remains manual-only and unpublished.

Two older alternate video exports remain untracked and untouched; the approved final video was
already committed. Fresh disposable validation directories are retained for reproducibility:
`/var/folders/0j/nm5klr3j6_5b3wwb2fp22bhr0000gn/T/codex-project-history-demo.yp1QwQ`
and `/tmp/cph-vscode.6q2FPE`. They contain synthetic state only; no demo process was started.

Next authorized work is complete. The suggested manual feedback checkpoint is September 10 at
21:18 EDT; no monitor was scheduled. Push, merge, release, and further public distribution remain
separate decisions.
