# Changelog

## 0.1.4 - 2026-09-03

- Initialize the privacy-safe demo with the installed official Codex runtime instead of a minimal,
  incompatible table, while isolating both Codex home directories from real user history.
- Use synthetic demo/test chat IDs and bound SQLite/Git child processes with timeouts before publication.
- Add a current-project-first Codex chat picker with repository, branch, age, and path context.
- Reopen selected chats through the official Codex editor route.
- Recover read-only history access when a clean WAL database has no sidecar files.
- Add concise diagnostics and configurable Codex state discovery.
- Add automated grouping, routing, installer, and SQLite lifecycle coverage.

This is the first public-ready release. The local database schema and editor route are not public
OpenAI extension APIs and may require future compatibility updates.
