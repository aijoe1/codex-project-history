# Privacy-safe demo capture

Run `bash demo/setup-fixture.sh`. It locates the Codex binary bundled with the installed official
OpenAI extension, asks that runtime to initialize a complete database under a temporary Codex
home, and only then inserts fictional repositories, chat titles, and synthetic IDs. It prints an
isolated VS Code launch command that sets both `CODEX_HOME` and `CODEX_SQLITE_HOME`; it never reads
or writes your normal Codex database.

The demo requires the VS Code `code` command, the official OpenAI Codex extension, Node.js, and
`/usr/bin/sqlite3`. For automated or nonstandard installations, set
`CODEX_PROJECT_HISTORY_CODEX_BIN` to the official Codex executable. These fixture entries have no
transcripts and are only for demonstrating the picker; do not select them for reopening.

Capture an 8 to 15 second clip:

1. Start on a simple card reading: `Recent chats look alike across projects.`
2. Press **Control+Command+H**.
3. Pause on the current-project-first group, branch, and path labels.
4. Type `deploy` to demonstrate filtering.
5. End on: `Local. Read-only. Project-aware.`

Before sharing, inspect every frame for usernames, notifications, tabs, private repository names,
or local paths. The fixture path under the system temporary directory is safe to show.
