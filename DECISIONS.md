# Decision Log

## Open Questions

- [ ] Choose whether to publish v0.1.4 only on GitHub first or also to the VS Code Marketplace.
- [ ] After the first public release, add a pinned vendor receipt to the private dotfiles copy so
  cross-machine installs can verify which public release they contain.

---

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
