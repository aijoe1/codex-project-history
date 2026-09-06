# Isolated activation test - 2026-09-06

Result: **PASS for picker activation and reload with an initialized synthetic database.**
The initial demo compatibility finding was fixed and independently retested later the same day.

## Artifact and environment

- Tested source: `4628ed9c7350230586c434258bb28f6be901461f`.
- Package: `codex-project-history-0.1.4.vsix`.
- Package SHA-256: `a9d36f3caa9043f4bf8193da6edc3156dc6243bdcaec7781bc6c77e71568b4f0`.
- VS Code: 1.136.1, commit `a44adf7f53e00964ab890f9f8758a334f1fc15bc`, macOS arm64.
- Installed dependency: `openai.chatgpt@26.901.22334`, bundled Codex CLI 0.153.0.
- Separate user-data directory, extensions directory, CODEX_HOME, and CODEX_SQLITE_HOME.
  No real chat database, login, or settings were copied into the test environment.
- The VSIX was installed through the VS Code CLI, which also installed its dependency.
  Installed runtime JavaScript matched the tested source byte for byte.

## Actual UI checks

Playwright's Electron connection drove the installed VS Code renderer. No extension API mocks
or changes to the installed extension were used. Screenshots were visually inspected.

| Check | Before reload | After reload |
| --- | --- | --- |
| Project Chats appears in the status bar | Pass | Pass |
| Clicking Project Chats opens the picker | Pass | Pass |
| Control+Command+H opens the picker | Pass | Pass |
| Three synthetic chats appear across two repositories | Pass | Pass |
| Current workspace group appears first | Pass | Pass |
| Search for `deploy` shows the two matching chats | Pass | Pass |

Reload used the actual **Developer: Reload Window** command. The extension-host log records
the first host exiting cleanly at 04:03:22, a new host starting, and both extensions activating
again. The test window was closed at 04:03:59; both extension hosts exited with code zero.

Evidence (refreshed from the compatible-fixture retest below):

- [Before reload: picker](activation-2026-09-06/before-reload-picker.png)
- [Before reload: search](activation-2026-09-06/before-reload-search.png)
- [After reload: picker](activation-2026-09-06/after-reload-picker.png)
- [After reload: search](activation-2026-09-06/after-reload-search.png)

## Fixture compatibility finding and resolution

The first attempt used the minimal database created by `demo/setup-fixture.sh` directly.
Project History activated and its picker worked, but the official Codex app-server failed to
initialize its SQLite state: the minimal table is not a complete Codex database.

For the successful test, the installed official CLI initialized a separate empty database via
`app-server` and an `initialize` request. After shutdown, the same three synthetic rows were
inserted into that complete schema with the additional required columns populated. The test
window then used that initialized database. Runtime code and the tested VSIX were unchanged.

There were no Project History activation/read failures or Codex SQLite initialization failures
in the successful run, before or after reload. Logs still contained expected synthetic-fixture
warnings for missing rollout files, Git warnings because the fixture repository has no initial
commit, and upstream Node deprecation warnings. These are not evidence of a clean end-to-end
Codex conversation session.

Commit `22b3847c018faa162c39983a8f68989923b18958` resolves this by locating the Codex executable
bundled with the installed `openai.chatgpt` extension and sending its `app-server` an `initialize`
request with disposable `CODEX_HOME` and `CODEX_SQLITE_HOME` directories. The setup inserts
synthetic rows only after the official process exits successfully. It never points the runtime at
the user's real database.

## Compatible demo retest

- Tested fix: `22b3847c018faa162c39983a8f68989923b18958`.
- Rebuilt package: `codex-project-history-0.1.4.vsix`.
- Package SHA-256: `a05cefc9d8c4d80f7bb16dd1c6673b82424c2dd70421761a7db6d869057473a7`.
- Fresh isolated install: `aijoe1.codex-project-history@0.1.4` plus
  `openai.chatgpt@26.901.22334` and its bundled Codex CLI 0.153.0.
- The default demo command located the installed official binary and initialized a full disposable
  schema. The final artifact test used the same supported binary override to target the exact
  dependency installed in the isolated extensions directory.
- The populated database contained three synthetic chats across two repositories. The installed
  runtime JavaScript matched the tested source byte for byte.
- Status bar, Control+Command+H, three-result grouping, current-project-first ordering, `deploy`
  search, and the actual **Developer: Reload Window** cycle all passed before and after reload.
- Extension-host logs show the old host exiting with code zero, a new host starting, both
  extensions activating again, and the final host exiting with code zero. Project History's two
  output logs were empty. No SQLite open, schema, compatibility, or activation error appeared.
- The final clean run used fresh user data, in-memory secrets, and disabled sync, telemetry,
  updates, and crash reporting. It did not select or resume a synthetic chat.

The official extension still reports expected stale-rollout warnings because the synthetic picker
rows deliberately have no transcript files. VS Code also reports upstream Node deprecation and
empty-repository Git warnings. None indicates a state-database initialization failure, and the
fixture remains unsuitable for validating chat reopening.

## Isolation and limits

The normal installed extension's two runtime files had identical SHA-256 hashes before and
after the test. All isolated VS Code main processes were confirmed stopped. The disposable
test data and raw logs remain local; only inspected screenshots and this report are tracked.

Synthetic chats test the picker only. No chat was selected for reopening, no sign-in or
chat-generation action was performed, and real-chat reopening remains outside this test. Publication
was not performed. The previously documented synchronous timeout limits still apply.
