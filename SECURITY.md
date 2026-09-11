# Security and privacy

Codex Project History reads local Codex metadata and archived transcript text. It does not upload,
rename, archive, or write directly to Codex history. Archived files must resolve inside a configured
Codex `archived_sessions` directory and match the selected chat UUID before they are read.

The read-only viewer excludes developer messages and known injected session-context blocks. Image
payloads and tool output are not rendered. Transcript text is untrusted local content and is shown
in a read-only virtual text document rather than executed or rendered as HTML.

The separate **Restore Archived Chat** action is intentionally state-changing. It requires a modal
confirmation and invokes `codex unarchive <UUID>` without a shell. It never edits SQLite directly
and does not automatically rearchive a restored chat.

## Reporting a vulnerability

Open a GitHub security advisory for vulnerabilities. Do not include chat titles, local paths,
repository names, database files, credentials, or other private data in a public issue.

Ordinary compatibility bugs can use the public issue tracker after diagnostic output is redacted.
