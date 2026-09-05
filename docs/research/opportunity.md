# Project-aware Codex chat history

Status: BUILD
First observed: 2026-09-02
Last checked: 2026-09-03
Score: 79/100

## Problem

When a developer uses Codex across several repositories, similar recent-chat titles make it hard
to identify which conversation belongs to the current project. Opening chats at random creates
avoidable context switching.

## Evidence

| Claim | Source | Observed | Strength | Caveat |
| --- | --- | --- | --- | --- |
| Developers have requested current-workspace grouping or filtering. | [OpenAI Codex issue #25319](https://github.com/openai/codex/issues/25319) | 2026-09-03 | High | Open issue, not a delivery commitment. |
| The same problem was reported earlier. | [OpenAI Codex issue #3550](https://github.com/openai/codex/issues/3550) | 2026-09-03 | Medium | Report volume is not market size. |
| A later report was closed as a duplicate of the canonical request. | [OpenAI Codex issue #31530](https://github.com/openai/codex/issues/31530) | 2026-09-03 | High | Duplicate evidence is not fully independent. |
| A user described opening random chats among roughly 50 sessions. | [Reddit firsthand report](https://www.reddit.com/r/OpenaiCodex/comments/1s36puq/i_am_having_a_hard_time_finding_old_chats_when/) | 2026-09-03 | Medium | One community report. |
| A full-featured competing extension already groups chats by project. | [Codex History Viewer](https://marketplace.visualstudio.com/items?itemName=hiztam.codex-history-viewer) | 2026-09-03 | High | Features and version can change. |
| VS Code is developing workspace-aware Agent Sessions with Codex support. | [Agent Sessions](https://code.visualstudio.com/docs/agents/run/sessions/manage-sessions) and [agent harnesses](https://code.visualstudio.com/docs/agents/run/agent-harnesses) | 2026-09-03 | High | Availability and defaults may vary by VS Code build. |

Evidence gate: PASS

Strongest confirmation: OpenAI's canonical issue asks for the same current-workspace behavior.

Strongest disconfirmation: a broader competing extension exists, and VS Code's native session
experience is moving toward workspace awareness.

## Decision

Build and share a deliberately narrow alternative:

> One keystroke, current-project-first, with repository, branch, age, and path visible. Local and
> read-only.

Treat this as a useful open-source tool and build-in-public case study, not as an uncontested
category or standalone startup.

## Scorecard

| Dimension | Points |
| --- | ---: |
| Exact pain evidence | 20/20 |
| Severity and repetition | 12/15 |
| Reachable audience | 12/15 |
| Remaining solution gap | 6/15 |
| Build leverage | 15/15 |
| Proof and demo strength | 10/10 |
| Low trust and maintenance risk | 4/10 |
| Total | 79/100 |

## Public claim ledger

| Claim | Status | Evidence or qualification |
| --- | --- | --- |
| The picker groups chats by project and puts the current workspace first. | Verified | Automated grouping tests and manual testing across multiple local VS Code workspaces. |
| It displays repository, branch, age, and path. | Verified | Shipped picker implementation and manual activation test. |
| It does not modify or upload Codex history. | Verified | Read-only SQLite invocation and no network or database-write path in the extension. |
| It handles the reproduced missing-WAL-sidecar failure. | Verified | Real macOS reproduction, regression test, and successful post-reload manual test. |
| It supports Linux or Windows. | Removed | The first public-ready release is macOS-first. |
| No other solution exists. | Removed | A competing extension and emerging native session UI exist. |
| The repository and install URL are live. | Planned | Verify only after the public repository is approved and created. |
