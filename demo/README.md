# Privacy-safe demo capture

Run `bash demo/setup-fixture.sh`. It locates the Codex binary bundled with the installed official
OpenAI extension, asks that runtime to initialize a complete database under a temporary Codex
home, and only then inserts fictional repositories, chat titles, and synthetic IDs. It prints an
isolated VS Code launch command that sets both `CODEX_HOME` and `CODEX_SQLITE_HOME`; it never reads
or writes your normal Codex database. The command also uses a separate, short `/tmp` user-data
directory. Use the exact printed command even if VS Code is already open: this ensures the fixture
environment reaches the new process and avoids VS Code's macOS IPC socket-path limit.

The demo requires the VS Code `code` command, the official OpenAI Codex extension, Node.js, and
`/usr/bin/sqlite3`. For automated or nonstandard installations, set
`CODEX_PROJECT_HISTORY_CODEX_BIN` to the official Codex executable. Active fixture entries have no
transcripts and should not be reopened. One archived entry has a fictional transcript specifically
for exercising the read-only archive viewer; do not try to restore its synthetic session ID.

Capture an 8 to 15 second clip:

1. Start on a simple card reading: `Recent chats look alike across projects.`
2. Press **Control+Command+H**.
3. Pause on the current-project-first group, branch, and path labels.
4. Type `deploy` to demonstrate filtering.
5. Run **Codex: Search Archived Chats by Project**, then open the synthetic archived result.
6. End on its read-only transcript banner: `Opening this document did not restore or modify the chat.`

Before sharing, inspect every frame for usernames, notifications, tabs, private repository names,
or local paths. The fixture path under the system temporary directory is safe to show. Close the
demo window before deleting both temporary directories printed by the setup script.
