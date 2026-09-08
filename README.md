# Codex Project History

Find the right local Codex chat by project, path, and Git branch before opening it.

The official Codex recent-chat picker can show similar titles from many repositories without
showing their project context. This small companion extension adds a current-project-first picker
without changing Codex history.

## What it does

- Groups local Codex chats by Git repository.
- Places the current VS Code workspace first.
- Shows repository owner, branch, age, and full working directory.
- Reopens the selected thread in the official OpenAI Codex editor.
- Reads local Codex metadata only. It does not rename, archive, upload, or modify chats.

## Requirements

- macOS
- VS Code 1.95 or newer
- The official OpenAI Codex extension (`openai.chatgpt`)
- The system `/usr/bin/sqlite3` executable

This release is intentionally macOS-first. Linux and Windows packaging are not yet supported.
If the newest Codex state database times out, the picker reports the failure instead of silently
falling back to an older database and presenting stale history.

## Install from source

```bash
git clone https://github.com/aijoe1/codex-project-history.git
cd codex-project-history
bash install-local.sh
```

Then run **Developer: Reload Window** in VS Code.

## Use

- Run **Codex: Search Chats by Project** from the Command Palette.
- Press **Control+Command+H** on macOS.
- Select **Project Chats** in the status bar.

The official Codex status item still opens OpenAI's ungrouped history. **Project Chats** is the
separate control provided by this extension.

## Privacy and compatibility

The extension reads only unarchived user chats created by the VS Code Codex extension. It honors
`CODEX_SQLITE_HOME`, then `CODEX_HOME`, and otherwise checks the newest compatible
`~/.codex/state_*.sqlite` database.

Active databases use SQLite's normal read-only path so WAL changes remain visible. If SQLite
reports `CANTOPEN` while both WAL sidecars are absent, the extension retries once as an immutable,
read-only snapshot. If sidecars appear during that retry, it discards the snapshot and reads the
live database normally.

OpenAI does not document this local database schema or editor route as a public extension API.
A future Codex update could require a compatibility release. On failure, the extension stops
without modifying data and offers **Show diagnostics**.

Each SQLite process has a two-second timeout; each Git lookup has a one-second timeout.
Timed-out processes are terminated. SQLite failures produce a concise diagnostic, and Git
failures fall back to working-directory matching. These calls are synchronous, so the extension
host can still pause briefly; multiple database candidates or workspace roots can add to that delay.

## Troubleshooting

1. Confirm the official OpenAI Codex extension is installed and enabled.
2. Run **Developer: Reload Window** after installation or an update.
3. Run **Codex: Search Chats by Project** again.
4. If it fails, choose **Show diagnostics** and include that output in a bug report. Remove private
   paths or repository names first.

## Development

```bash
npm test
npm run check
node scripts/smoke.js "$PWD"
```

The smoke command reads real local metadata, so review its output before sharing it. The automated
tests use temporary fixtures and do not access your Codex history.

See [SECURITY.md](SECURITY.md) for responsible reporting and [CHANGELOG.md](CHANGELOG.md) for
release history.

## License

MIT
