# Project Chats launch packet v0.1.5

Draft revision: `launch-packet-v0.1.5-r1`
Prepared: 2026-09-08
Status updated 2026-09-10: GitHub reply and X launch published after separate approvals; the first
X checkpoint was captured late at 26 hours 16 minutes with a `MAINTAIN` decision.
The final status-bar video was approved and published with X. The owner manually submitted the
Reddit post, but Reddit's automated filters immediately removed it. See the [X receipt](x-launch-receipt.md),
[Reddit attempt receipt](reddit-launch-receipt.md), and [current follow-up](launch-followup-v0.1.5.md).
One owner-approved Modmail appeal was sent September 11 at approximately 00:38 EDT.
The automated response cited 0 r/Codex comment karma as the probable removal cause and said the
moderation team responds only after the account reaches at least 1, despite also claiming detailed
helpful posts are exempt.
The original drafts and proposed order below are historical, not outstanding publication tasks.

## Recommendation

Share Project Chats as the small, open-source picker built from a real multi-project workflow
problem. Lead with the firsthand moment and the working shortcut. Do not claim novelty: VS Code now
has a workspace-aware Sessions surface, and several Marketplace extensions offer broader history
management.

Recommended order:

1. Review the text-only, affiliation-disclosed reply to OpenAI Codex issue #25319 for approval.
2. Capture the privacy-safe 8-15 second fixture demo using the installed VS Code app.
3. Post the deeper explanation to r/codex after checking the current rules in the logged-in UI.
4. Post the short demo on X, linking to the v0.1.5 release or repository.

## Source story

I use Codex across several projects. When I opened the recent-chat list in VS Code, I could see the
titles, but not which project each conversation belonged to. The workaround was to open chats until
I found the right one. That is a small interruption, but it repeats every time I switch projects.

Other developers described the same problem. OpenAI's current feature request asks for chats to be
scoped, grouped, or filtered by workspace, with current-workspace threads shown first. It remained
open on September 8 with 80 thumbs-up reactions and 37 comments.

I built the narrow version I wanted: press Control+Command+H and get a searchable picker with the
current project first, plus repository, branch, age, and working directory. Selecting a result passes
the thread to the official Codex extension to open.

This is deliberately smaller than the history dashboards already available. It does not render full
transcripts, track usage, or sync chats between computers. Version 0.1.5 is open source, local and
read-only, and currently supports macOS. It relies on Codex internals that OpenAI does not document
as public extension APIs, so future Codex updates may require compatibility fixes.

The useful question is whether the narrow picker fits other multi-project workflows. If you try it,
report the repository layout that works or breaks, especially multi-root workspaces and worktrees.

## GitHub issue #25319 reply

Destination: https://github.com/openai/codex/issues/25319

Published by `aijoe1` after explicit approval of this exact draft. Verified by reading back the
comment's author, destination, and full body. Published at 2026-09-09 02:35:58 UTC
(2026-09-08 22:35:58 EDT).

Receipt: https://github.com/openai/codex/issues/25319#issuecomment-5594914552

> I ran into this exact problem and built a small open-source companion while this request remains
> open. Disclosure: I am the author.
>
> Project Chats adds a current-workspace-first picker to VS Code. It shows repository, branch, age,
> and working directory, then passes the selected thread to the official Codex extension to open. It
> reads local Codex metadata and does not rename, archive, upload, or modify chat history.
>
> Source and macOS install: https://github.com/aijoe1/codex-project-history
>
> Current limits: v0.1.5 is macOS-only, is distributed through GitHub rather than the VS Code
> Marketplace, and depends on a local Codex schema and editor route that are not documented public
> APIs. I would especially value reports about multi-root workspaces and worktrees.

## r/codex draft

Proposed title: `I built a small project-aware chat picker for the Codex VS Code extension`

> I kept running into the same problem when moving among projects in VS Code: Codex's recent-chat
> list showed similar titles from every repository without enough project context. I was opening
> chats one by one just to find the right thread.
>
> I built the narrow fix I wanted. **Project Chats** opens with Control+Command+H, puts the current
> project first, and shows the repository, branch, age, and working directory before you select a
> chat.
>
> It is open source and reads local metadata without modifying Codex history:
> https://github.com/aijoe1/codex-project-history
>
> Honest limits: it is macOS-only today, installation is through GitHub, and Codex could change the
> undocumented local schema or editor route it relies on. There are also broader alternatives such
> as VS Code's Sessions view, Codex History Viewer, CodexChat, and Codex Project Chat Resumer. I kept
> this one intentionally small: one picker rather than another history dashboard.
>
> I am the author. If you try it, I would value one specific kind of feedback: does it correctly put
> the current project first in your workspace/worktree setup?

Before publishing: check r/codex's current self-promotion and link rules in the logged-in Reddit UI.
The public rules page did not expose readable rule text during the 2026-09-08 research pass.

## X draft

Post copy:

> Codex mixed chats from every repo into one unlabeled list. I opened them one by one to find the
> right thread.
>
> I built Project Chats: ⌃⌘H opens a current-project-first picker with repo, branch and path.
>
> Open source, macOS:
> https://github.com/aijoe1/codex-project-history

Attach: the synthetic 8-15 second clip from `docs/briefs/demo-capture.md`. The fixture and capture
runbook are ready; the final screen recording and frame-by-frame privacy check remain manual and
must be completed before the X post. The GitHub reply does not require media. The unsuccessful
automation attempt and its cleanup are recorded in `docs/reviews/2026-09-08-demo-capture.md`.

Alt text draft: `A synthetic VS Code demo opens Project Chats with a keyboard shortcut, shows the
current project first with repository and branch labels, then filters fictional chats by the word
deploy.`

## Claim receipt

| Claim | Status | Source or qualification |
| --- | --- | --- |
| The official feature request remains open with 80 thumbs-up reactions and 37 comments. | Source-backed | OpenAI Codex issue #25319, checked 2026-09-08. |
| v0.1.5 provides the described picker fields and shortcut. | Verified | Exact shipped source, package manifest, and tests. |
| The extension does not modify or upload Codex history. | Verified | Exact shipped source has read-only SQLite calls and no network or database-write path. |
| The extension works after reload on two Macs. | Observed | Owner-confirmed activation checks; not a claim of broad macOS compatibility. |
| The extension is first, unique, or cross-platform. | Removed | Competing products exist; Windows and Linux are unvalidated. |

## Publication gate (current)

The GitHub reply above and the separately approved question-led X post are already published.
The historical X copy above was not the selected copy; use x-launch-receipt.md for the exact post.
Do not post either again. The owner manually submitted Reddit revision r3, but Reddit filtered it;
do not repost. One approved Modmail appeal was sent; any additional post, reply, or moderator
message requires separate approval. The next channel step is genuine r/Codex participation, then
rechecking the original post after the account reaches at least 1 r/Codex comment karma.
