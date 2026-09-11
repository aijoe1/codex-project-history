# Decision Log

## 2026-09-11 - Archived chats open read-only; restoration is explicit and CLI-mediated `ACTIVE`

**What:** Add a separate project-aware archive picker that opens archived JSONL transcripts as
read-only virtual text documents inside VS Code. Keep restoration behind its own modal confirmation
and delegate the mutation to `codex unarchive <UUID>` with an exact argument-vector invocation.
Never write the Codex database directly and never automatically rearchive on editor close.

**Why:** The user wants to revisit archives without browsing local folders or silently changing
their state. Reusing the shipped Project Chats grouping keeps the workflow native. A virtual text
document avoids a custom webview and treats transcript content as untrusted text. Automatic
unarchive/rearchive cannot recover reliably from window reloads, crashes, or concurrent clients.

**Product-flow preflight:** User: a multi-project Codex user. Job: find and reread an archived
conversation. Primary action: choose it from **Codex: Search Archived Chats by Project**. Required
information: title, repository, branch, age, and working directory. Trust concern: private transcript
exposure or accidental restoration. Observable success: a readable in-editor transcript opens and
the archived-row count stays unchanged. Borrow: the shipped Project Chats Quick Pick, VS Code's
native virtual-document editor, and the official Codex editor for active chats. Do not copy: custom
HTML rendering, implicit restoration, or lifecycle-based rearchiving.

**Threat model and compatibility:** Resolve each transcript and its allowed archive roots through
the filesystem before reading; require a matching UUID and `.jsonl` suffix; reject paths outside
configured `archived_sessions` roots. Render only user/assistant text, filter known injected context,
omit tool output and image bytes, and cap rendered text at four million characters. Validate restore
UUIDs, prefer the official extension's bundled binary, avoid shell execution, bound the CLI process
to ten seconds, and require explicit confirmation.
The SQLite and JSONL formats remain private OpenAI compatibility surfaces and must fail closed.

**Impact:** Prepare v0.2.0 on a feature branch. Viewing remains read-only. Restoration changes state
only after the user chooses the dedicated action and confirms it. Publishing, installing over v0.1.5,
refreshing the dotfiles vendor snapshot, and merging remain separate release decisions.

## 2026-09-10 - Maintain the shipped wedge and test distribution separately `ACTIVE`

**What:** Keep Project Chats v0.1.5 unchanged after the first X follow-up. Treat the prepared
manual r/codex post as the next optional distribution experiment, subject to a separate exact
publication approval, and wait for the 7-day checkpoint before reconsidering product scope.

**Why:** The late 24-hour X observation produced one qualified onboarding question, one link click,
and usable video retention, but only 59 impressions and no verified public install, failure, or bug
report. The sample is too small to support either a feature pivot or a demand rejection.

**Impact:** The README now answers the surfaced import question. No new feature, paid promotion,
reply, or cross-post is authorized by this decision. Continue channel-specific measurement and keep
GitHub downloads separate from attributable installations.

## 2026-09-09 - X launch followed by evidence-led, manual Reddit distribution `ACTIVE`

**What:** Published the explicitly approved question-led X post and synthetic status-bar demo;
review early feedback before broader distribution. Prepare Reddit content for manual submission.

**Why:** Specific workflow pain and a visible picker demo communicate the utility without novelty
claims. The recorded r/codex rules check prohibits bots and favors detailed, useful showcases.

**Impact:** Owner reports answering the first X question. No further replies/publication approved.
Measurement targets are manual; records remain local until separate push approval.
Launch evidence and remaining work: `docs/briefs/x-launch-receipt.md` and
`docs/briefs/launch-followup-v0.1.5.md`.

## 2026-09-08 - Share as a focused utility, not a unique category `ACTIVE`

**What:** Keep the opportunity verdict at 79/100 and share Codex Project History as a deliberately
narrow open-source picker for multi-project Codex users. Lead with the firsthand workflow problem,
the current-project-first shortcut, and the honest macOS/read-only boundary. Do not claim the tool is
the first, only, or comprehensive solution.

**Why:** OpenAI issue #25319 remained open with 80 thumbs-up reactions and 37 comments and requests
almost the exact shipped behavior. Independent Reddit and OpenAI issue reports pass the demand gate.
However, VS Code now documents a workspace-aware Sessions surface with external Codex support, and
several Marketplace extensions offer broader project history management.

**Impact:** Review the text-only reply on the canonical OpenAI issue first. Prepare the synthetic
demo separately, then the r/codex post after checking current community rules, and the X demo post.
The failed copied-app capture attempt does not block review of the text reply. Marketplace
publication and any public post remain separate approval boundaries.

## Open Questions

- [ ] After the first public release, add a pinned vendor receipt to the private dotfiles copy so
  cross-machine installs can verify which public release they contain.

---

## 2026-09-08 - Timeouts fail visibly and npm publication stays disabled `ACTIVE`

**What:** Prepare v0.1.5 so a timeout reading the newest Codex state database is terminal rather
than falling back to an older database. Mark the package private so npm refuses publication; the
approved distribution channel remains GitHub Releases.

**Why:** Schema incompatibility can justify trying an older state database, but a timeout says
nothing about compatibility. Falling back in that case can silently show stale chat history.
This extension is packaged as a VSIX and has no separately approved npm destination.

**Impact:** Slow or locked current databases now produce a concise timeout instead of stale
results. Future npm publication requires an explicit decision that removes the private guard.
The user approved continuing with the prepared v0.1.5 GitHub release on 2026-09-08.
Publish the tested branch revision; merging either repository remains a separate step.

## 2026-09-06 - Publish v0.1.4 on GitHub before the VS Code Marketplace `ACTIVE`

**What:** Publish the first public release at `aijoe1/codex-project-history` with the tested VSIX
and its SHA-256 checksum. Defer VS Code Marketplace publication to a separate decision and
approval.

**Why:** A GitHub-first release makes the source, security boundary, installation path, and exact
artifact independently reviewable while keeping Marketplace credentials and maintenance outside
the first launch.

**Impact:** GitHub becomes the canonical public source and release channel for v0.1.4. Marketplace
availability must not be claimed until a later release is separately approved and verified.

## 2026-09-06 - Demo schema comes from the installed official Codex runtime `ACTIVE`

**What:** The privacy-safe demo locates the Codex executable bundled with `openai.chatgpt`, runs
its `app-server` initialization protocol with disposable `CODEX_HOME` and `CODEX_SQLITE_HOME`
directories, and inserts synthetic picker rows only after that process exits successfully. A
binary-path override exists for automated tests and nonstandard installations.

**Why:** Copying an internal schema or maintaining a minimal lookalike database breaks when Codex
adds required tables or columns. Letting the installed dependency create its own isolated schema
tracks the exact runtime that will open the demo window without touching real chat history.

**Impact:** Demo setup now requires Node.js, the official OpenAI extension, and its bundled Codex
binary. Upstream protocol or directory-layout changes fail closed with a diagnostic and require a
compatibility update. Synthetic rows still have no transcripts and must not be presented as proof
of chat reopening.

## 2026-09-08 - Isolated demo launches use a short VS Code user-data path `ACTIVE`

**What:** The demo setup creates a separate VS Code user-data directory under `/tmp` and includes
`--new-window --user-data-dir=...` in the printed launch command.

**Why:** A launch under the normal macOS `TMPDIR` failed before opening a window because VS Code's
Unix-domain IPC socket path exceeded its 103-character limit. A separate user-data root also makes
the fixture environment reach a new process when the user's normal VS Code instance is already
running.

**Impact:** Demo capture no longer depends on closing the normal editor. The temporary Codex state
and VS Code user-data directories are both printed for explicit cleanup after the demo window is
closed. This changes only the demo workflow, not the extension's runtime interface.

## 2026-09-03 - Standalone repository becomes canonical after public release `ACTIVE`

**What:** Prepare Codex Project History as a standalone repository. Once the first public release
is approved and created, this repository becomes the canonical editable source. The private
dotfiles repository keeps a pinned, tested vendor snapshot for `dotup` installation rather than a
second independently edited implementation.

**Why:** Two editable copies would drift in code, tests, documentation, and version numbers. A
public canonical source plus a pinned private distribution copy keeps contribution history and
cross-machine installation compatible without introducing a Git submodule into routine dotfiles
setup.

**Impact:** Future feature and compatibility work starts here. Each release updates the dotfiles
snapshot with the public tag or commit recorded in a vendor receipt and reruns both repositories'
tests.

## 2026-09-03 - First public-ready release stays macOS-first and read-only `ACTIVE`

**What:** Version 0.1.4 targets macOS with VS Code 1.95+, the official OpenAI Codex extension, and
the system `/usr/bin/sqlite3`. It reads local Codex metadata and opens selected threads, but has no
database mutation or network-upload path.

**Why:** The verified user problem and original SQLite failure occurred on macOS. Claiming broader
platform support before real activation tests would turn a tested local tool into an unverified
cross-platform promise. The read-only boundary limits the damage if OpenAI changes its internal
schema or editor route.

**Impact:** Linux and Windows remain explicit non-goals for v0.1.4. Compatibility failures stop
with a concise diagnostic. Platform expansion requires real installation and activation proof on
that platform.

## 2026-09-05 - Sanitize fixtures and bound external processes before publication `ACTIVE`

**What:** Use a synthetic UUID namespace for demo/test chats. Rebuild the unpublished release
commit from the clean bootstrap parent, keeping a private recovery bundle outside this repository.
Set per-process timeouts of two seconds for SQLite and one second for Git, with SIGKILL termination.

**Why:** Demo fixtures must not route to real conversations. A timeout using the default SIGTERM
can still wait indefinitely if a child ignores that signal; forced termination bounds that case.

**Impact:** Existing public history is unaffected because this repository has not been published.
The calls remain synchronous and can pause the extension host for the configured duration; multiple
lookups can accumulate. A fully asynchronous implementation remains a future responsiveness improvement.
