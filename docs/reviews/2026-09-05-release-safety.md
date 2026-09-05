# Release safety verification - 2026-09-05

The unpublished release now uses synthetic fixture IDs and bounded child processes.
A complete recovery bundle was verified and retained privately outside the repository before
rebuilding the release on the original clean bootstrap parent.

## Checks performed

- All 22 tests passed with no skips, including a real SQLite WAL lifecycle test.
- Three real child-process tests ran children that ignore SIGTERM: normal SQLite and immutable
  retry were killed after approximately two seconds each; Git was killed after approximately
  one second and working-directory grouping remained usable.
- JavaScript syntax and both shell script syntax checks passed.
- Generated demo SQLite data loaded three synthetic chats, grouped the current workspace first,
  and had no ID overlap with the live unarchived VS Code chats returned by the loader.
- The modified loader successfully read the current real local Codex database. No chat titles,
  paths, or real IDs are recorded here.
- The rebuilt VSIX contained nine files. Its runtime JavaScript and package manifest matched
  the reviewed source byte for byte. Gitleaks found no secrets in the release working tree.
- Dependency files were unchanged from the preceding audit, which reported zero known npm
  vulnerabilities on the same date.

## Remaining limits

These synchronous calls can still pause the extension host for the timeout duration. Multiple
workspace roots, database candidates, or a recovery retry can accumulate delay. The change bounds
each child process; it does not make the whole picker asynchronous or impose one overall deadline.

The schema and editor route remain undocumented upstream interfaces. A fresh editor activation
of this revision and hosted CI are still pending. No GitHub publication, Marketplace publication,
or installation over an existing user extension was performed for this verification.
