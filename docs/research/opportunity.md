# Project-aware Codex chat history

Status: SHIPPED — FOLLOW_UP
Owner: Joseph Yu
First observed: 2026-09-02
Research last checked: 2026-09-08 (historical evidence, not refreshed by the wrapup)
Distribution updated: 2026-09-10; GitHub and X published, Reddit submitted manually then filtered.
Current receipts: `../briefs/x-launch-receipt.md`, `../briefs/reddit-launch-receipt.md`, and
`../briefs/launch-followup-v0.1.5.md`.
Decision: BUILD AND SHARE
Follow-up decision: MAINTAIN; next measurement September 16. The Reddit test produced no exposure
result because automated filters removed it; a Modmail appeal requires separate approval.
Score: 79/100

## Problem

When a developer uses the Codex VS Code extension across several repositories, its global recent-chat
list can make similar titles difficult to attribute to the right project. Opening chats one by one
creates avoidable context switching and a risk of resuming the wrong project thread.

- Original repro: open **Codex Chats** in a VS Code workspace with history from several projects;
  chat titles appear without project attribution.
- Environment: macOS, VS Code, official OpenAI Codex extension.
- Frequency: repeatable across the owner's VS Code workspaces and independently reported in OpenAI's
  issue tracker and two subreddits.
- Previous workaround: open candidate chats individually, rename them, isolate each project with a
  separate `CODEX_HOME`, or use a different history extension.
- Private details to exclude: real chat titles, local usernames, full home-directory paths, private
  repository names, and the real Codex database.

## Evidence ledger

| Claim | Source | Type | Observed | Independence | Strength | Caveat |
| --- | --- | --- | --- | --- | --- | --- |
| OpenAI's canonical request asks for Codex VS Code history to be scoped, grouped, or filtered by workspace and proposes showing current-workspace threads first. It remained open with 80 thumbs-up reactions and 37 comments. | [OpenAI Codex #25319](https://github.com/openai/codex/issues/25319) | Official issue / firsthand reports | 2026-09-08 | Canonical | High | Engagement supports demand, not market size or a delivery commitment. |
| An earlier issue reports that history from three projects appears in every project and asks for project separation or filtering. | [OpenAI Codex #18947](https://github.com/openai/codex/issues/18947) | Official issue / firsthand report | 2026-09-08 | Independent | Medium | Four thumbs-up reactions and one comment are modest engagement. |
| A developer reported opening random chats from a list of about 50 to find one associated with an older project. | [r/codex report](https://www.reddit.com/r/codex/comments/1s388vo/why_arent_chats_linked_to_projects_i_am_having_a/) | Firsthand report | 2026-09-08 | Independent | Medium | One community report; no severity measurement beyond the described workflow. |
| A second developer reported that Codex sessions from personal and work repositories are mixed across VS Code workspaces. | [r/vscode report](https://www.reddit.com/r/vscode/comments/1vix65v/codex_sessions_are_shared_across_workspaces/) | Firsthand report | 2026-09-08 | Independent | Medium | The thread offers dev-container isolation as a workaround, not a native Codex fix. |
| A third developer described the same global `~/.codex` history behavior and the burden of opening chats to identify their project. | [r/codex isolation thread](https://www.reddit.com/r/codex/comments/1uwgwws/isolating_chatstasks_per_projectworkspace_in/) | Firsthand report / workaround | 2026-09-08 | Independent | A per-project `CODEX_HOME` can isolate history, but adds setup and duplicated configuration. |
| VS Code now documents a first-party Sessions view where Chat view sessions are scoped to the current workspace and external Codex sessions can be shown. | [VS Code session documentation](https://code.visualstudio.com/docs/agents/run/sessions/manage-sessions) | Official alternative | 2026-09-08 | Independent | This is a different VS Code surface from OpenAI's Codex sidebar; the provider API remains proposed. |
| Codex Project Chat Resumer ships a Marketplace companion with project restoration, an optional conversation tree, collections, and Windows/macOS/Linux support. | [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=alkan-labs.codex-project-chat-resumer) | Direct competitor | 2026-09-08 | Independent | It solves more than the narrow picker and uses an undocumented OpenAI thread URI for direct opening. |
| Codex History Viewer ships project views, full-text search, session rendering, and Codex/Claude history support. | [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=hiztam.codex-history-viewer) | Direct competitor | 2026-09-08 | Independent | It is a broader history product rather than a minimal recent-chat replacement. |
| CodexChat groups local Codex sessions by recorded working directory and adds transcript and token views. | [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=MathsionYang.codexchat) | Direct competitor | 2026-09-08 | Independent | It is a fuller Activity Bar manager rather than a one-command picker. |

Evidence gate: PASS

Strongest confirmation: OpenAI issue #25319 describes almost the exact requested behavior and has
meaningful independent engagement.

Strongest disconfirmation: first-party VS Code Sessions and several active Marketplace extensions
now solve overlapping jobs. This is not an uncontested category.

## Solution landscape

| Option | Solves | Misses | Price/access | Activity | Trust/maintenance |
| --- | --- | --- | --- | --- | --- |
| Official Codex recent-chat picker | Opens recent Codex threads | Project attribution in the global list, based on the reproduced behavior | Included with Codex | Active | First party |
| VS Code Sessions | Workspace-scoped Chat view, workspace grouping, external Codex sessions | It is a different surface; external-session visibility requires configuration | Included with VS Code | Current docs dated 2026-09-02 | First party; provider API is proposed |
| Per-project `CODEX_HOME` | Strong storage isolation | Repeated setup, duplicated configuration/sign-in, fragmented global history | Free workaround | Community workaround | Stores sensitive history inside each selected location |
| Codex Project Chat Resumer | Automatic latest-thread restoration, project tree, collections | More UI and behavior than a quick picker | Marketplace | v0.4.1 observed | Reads via App Server; opening relies on an undocumented URI |
| Codex History Viewer | Deep multi-agent history, search, views, metadata | Heavier than the narrow attribution job | Marketplace, MIT | v2.14.1 dated 2026-09-07 | Broad local-history surface and larger maintenance scope |
| CodexChat | Project grouping, transcript view, token summaries | Heavier than the narrow attribution job | Marketplace, MIT | Repository pushed 2026-09-04 | Reads local session data and uses a version-gated internal route |
| Codex Project History v0.1.5 | One shortcut; current project first; repository, branch, age, and path; passes the selected thread to official Codex | macOS only, GitHub install, no transcript viewer or cross-device history sync | Free, MIT, GitHub Release | Released 2026-09-08 | Local metadata only; undocumented schema/route can require compatibility releases |

## Scorecard

| Dimension | Weight | Score 0-5 | Weighted points | Evidence note |
| --- | ---: | ---: | ---: | --- |
| Exact pain evidence | 20 | 5 | 20 | Owner repro plus exact canonical request. |
| Severity and repetition | 15 | 4 | 12 | Several independent reports; canonical issue has 80 thumbs-up reactions. |
| Reachable audience | 15 | 4 | 12 | OpenAI issue participants, r/codex, r/vscode, GitHub, and Marketplace users are reachable. |
| Remaining solution gap | 15 | 2 | 6 | The official sidebar gap remains, but first-party and Marketplace alternatives overlap heavily. |
| Build leverage | 15 | 5 | 15 | The focused extension is already released and distributed through dotfiles. |
| Proof and demo strength | 10 | 5 | 10 | Deterministic tests, synthetic demo, and two-Mac activation checks exist. |
| Low trust/maintenance risk | 10 | 2 | 4 | Read-only design limits damage, but private schema/route compatibility and macOS-only support remain. |
| Total | 100 | | 79/100 | Evidence supports sharing as a focused utility, not a standalone startup. |

## Build contract

- User and job: a developer moving among several VS Code repositories who needs to find the correct
  local Codex thread quickly.
- Differentiated promise: one shortcut opens a current-project-first picker with repository, branch,
  age, and path, without adding a transcript dashboard.
- Acceptance criteria: project grouping, current project first, search across title/repository/branch/
  path, exact thread opening, concise diagnostics, and no Codex-history mutation.
- Non-goals: transcript rendering, analytics, automatic project isolation, cross-device chat sync,
  Windows/Linux support in v0.1.5, or replacement of the official Codex extension.
- Privacy/permissions: read local metadata only; never use real chat data in public media.
- Compatibility risk: OpenAI does not document the local state schema or editor route as public APIs.
- Demo moment: press Control+Command+H, show the current project first, then type `deploy` to filter a
  fully synthetic fixture.

## Proof receipt

- Original failure observed: the owner reproduced global, unattributed recent chats across multiple
  VS Code projects.
- Deterministic checks: 25 tests and JavaScript syntax checks passed again on 2026-09-08.
- Independent real-output proof: the installed v0.1.5 picker loaded real local metadata on one Mac;
  the owner confirmed Project Chats worked after reload on two Macs. Public media must still use the
  synthetic fixture.
- Version/build/SHA: v0.1.5, release commit `96613a140de43de78f7981e4c1ea453944af1356`,
  VSIX SHA-256 `98786cae70cd51d5ab7b6521195950905d6ad75d8db8e273f044264bbc5cb233`.
- Limitations: this research pass did not independently re-prove selection-to-reopen on both Macs;
  Linux and Windows remain unvalidated; Marketplace installation is unavailable.

## Public claim ledger

| Draft claim | Status | Evidence | Scope/qualification |
| --- | --- | --- | --- |
| Developers have asked OpenAI to scope or group Codex VS Code chats by workspace. | Source-backed | OpenAI #25319 and #18947 | Do not convert engagement into a user-count estimate. |
| Project Chats groups local chats by repository and puts the current workspace first. | Verified | Shipped source, tests, and owner activation on two Macs | macOS v0.1.5 only. |
| It shows repository, branch, age, and working directory. | Verified | Shipped Quick Pick implementation | Working directory can be sensitive; demo only with fixtures. |
| It reads local metadata and has no chat mutation or upload path. | Verified | Exact v0.1.5 source and dependency scan | Applies to this extension, not to the official Codex service. |
| It is available from a public GitHub Release. | Verified | Live v0.1.5 release and asset digest checked 2026-09-08 | It is not in the VS Code Marketplace. |
| It is the first or only solution. | Removed | Multiple Marketplace competitors and VS Code Sessions exist | Position as the focused option. |
| It supports Windows or Linux. | Removed | No real activation proof | macOS only. |

## Distribution packet

- Durable home: https://github.com/aijoe1/codex-project-history
- Release: https://github.com/aijoe1/codex-project-history/releases/tag/v0.1.5
- Primary audience: Codex VS Code users who work across several repositories.
- Source story: firsthand friction led to a narrow picker; current independent reports validate the
  job; the extension is intentionally smaller than the available history dashboards.
- Approved demo: `docs/media/project-chats-button-demo-pullback-v0.1.5.mp4`, 11.1 seconds,
  published with the approved X post; synthetic grouping/filtering, not real-chat reopening proof.

| Channel | Native angle | Draft revision | Approval | URL/status |
| --- | --- | --- | --- | --- |
| OpenAI issue #25319 | Useful affiliation-disclosed implementation reply | `launch-packet-v0.1.5-r1` | Exact draft approved by owner | [Published and read back](https://github.com/openai/codex/issues/25319#issuecomment-5594914552), 2026-09-09 02:35:58 UTC |
| r/codex | Firsthand workflow fix with limits | Follow-up r3 | Owner submitted manually after reviewing copy, flair, and rules | [Filtered immediately after submission](../briefs/reddit-launch-receipt.md); Modmail appeal not sent |
| X | Question-led workflow friction plus status-bar clip | Selected option 1; exact copy in X receipt | Owner approved copy and final video | [Published September 9, 21:18 EDT](https://x.com/nightlydaytrade/status/2097857090358329527) |

## Results

Use a separate clock for each publication. The GitHub issue reply was published September 8 at
22:35:58 EDT; its 24-hour checkpoint was missed, so the September 10 observation is a late baseline.
The X post was published September 9 at 21:18 EDT and reaches 24 hours September 10 at 21:18 EDT.
No recurring monitor or scheduled task has been enabled.

| Checkpoint | Observable metrics | Qualitative feedback | Decision |
| --- | --- | --- | --- |
| 24 hours | Captured late at 26h16m: X 59 impressions, 7 engagements, 2 detail expands, 0 profile visits, 1 link click, 2 likes, 1 outside reply, 0 reposts/bookmarks; video 22 unique/23 total views with 39% retention at 11 seconds. GitHub late baseline: 1 v0.1.5 download, 0 stars/forks/watchers, 0 repository issues, 0 issue-reply reactions. Reddit was manually submitted afterward but immediately filtered, so it has no exposure baseline. | One qualified question about automatic history discovery, classified as positioning/onboarding and answered in README. No public install result or bug report. Reddit filtering is a distribution outcome, not demand evidence. Sample too small for a product conclusion. | MAINTAIN; consider one Modmail appeal, then review September 16 |
| 7 days | Cumulative downloads/stars, unique reports, resolved bugs | Identify repeated platform or install requests | Pending |
| 30 days | Same measures with source and date | ITERATE, MAINTAIN, REPOSITION, or RETIRE | Pending |
