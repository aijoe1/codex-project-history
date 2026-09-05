# Demo capture brief

Goal: show the current-project-first result in 8 to 15 seconds without exposing real Codex data.

## Setup

1. Run `bash demo/setup-fixture.sh`.
2. Copy the printed launch command into a terminal.
3. In the Extension Development Host, verify that **Control+Command+H** shows only fictional data.
4. Hide notifications, account controls, unrelated tabs, and the macOS menu-bar clock if desired.

## Sequence

| Time | Frame | On-screen action |
| --- | --- | --- |
| 0-2s | Plain opening card | `Recent chats look alike across projects.` |
| 2-6s | VS Code | Press **Control+Command+H**. |
| 6-10s | Project Chats picker | Pause on the current-project group, branches, and paths. |
| 10-12s | Picker search | Type `deploy`. |
| 12-15s | Plain closing card | `Local. Read-only. Project-aware.` |

## Acceptance gate

- Every displayed repository, path, and chat title is fictional.
- The current project is visibly first.
- Filtering changes the result list.
- No unsupported speed, privacy, compatibility, or novelty claim appears.
- The final exported GIF is readable at X feed width and remains under the platform's current size
  limit, checked immediately before publishing.
