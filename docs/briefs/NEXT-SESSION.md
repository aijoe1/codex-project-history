# Continue Project Chats after requested wrapup

## Launch checkpoint update — September 12, 2026, 13:37 EDT

The late Reddit 24-hour check is recorded in `launch-followup-v0.1.5.md` and
`reddit-launch-receipt.md`: signed-in post at 4.5K views, score 0, one repost, and only an
automated comment. Chrome Incognito encountered Reddit's humanity CAPTCHA, so logged-out
readback remains unverified. X showed 68 impressions, 13 engagements, and one link click;
GitHub remained at one v0.1.5 download and zero stars/issues. No public installation or bug
report was observed. Decision remains `MAINTAIN`. Do not repost, reply, appeal again, or pay
to boost. Review X/GitHub again September 16; weekly r/Codex showcase participation needs
its own exact draft and approval. PR #3 carries the Reddit launch record; verify its current
head and checks before proposing a merge.

## Reconciliation update — September 10, 2026, 23:57 EDT

Shared records and historical launch/capture gates have been reconciled. Pull request #2 was merged
as `5c225f98c404b4d6c22b1b2a4c9c0533270fb46c`. The old pending steps below are retained as provenance,
not instructions to repeat completed work. The approved pullback video remains tracked.

The late first X checkpoint is complete: 59 impressions, 7 engagements, 1 link click, 22 unique
video views, and one qualified onboarding question, with no verified public install or bug report.
Decision: `MAINTAIN`; review again September 16. The owner manually submitted Reddit revision r3 at
approximately 23:56 EDT, but Reddit's automated filters immediately removed it. The exact receipt is
in `reddit-launch-receipt.md`. The owner separately approved one concise Modmail appeal; it was sent
September 11 at approximately 00:38 EDT and Reddit displayed `Message sent`. The immediate automated
response reported 0 r/Codex comment karma, said moderators do not respond below 1, and identified
that as the probable removal cause, while also claiming detailed helpful posts are exempt. At 00:49
EDT, the removal banner was gone, the post appeared in the signed-in `New` feed, and it showed about
1.1K views. Logged-out readback remains unavailable. Do not repost or reply again. Genuine r/Codex
participation is the next account-health step, but it must add independent value rather than promote
Project Chats. No scheduled monitor, new post, reply, additional appeal, merge, or release is
authorized. Start from
the canonical checkout at `/Users/miniai/Codex Project History`, fetch before relying on branch or
pull-request state, and review the latest HANDOFF-INDEX.md and Git status first.

The initial snapshot was recorded September 9, 2026, 22:21 EDT. This updated reconciliation is
the authoritative continuation snapshot; older launch-packet and HANDOFF-INDEX status lines are
historical and not current.

## Historical next-session prompt (superseded)

Do not follow this section as current instructions; it records the state before pull request #2.

Continue the Project Chats launch in `/private/tmp/codex-project-history-v015`, branch
`codex/timeout-terminal-v015`. Do not work in Peptide Portal (the previous session's unrelated cwd).
Read AGENTS.md, this file, x-launch-receipt.md, and launch-followup-v0.1.5.md first.

First verify that existing-file apply_patch works after restarting the affected Codex/editor
session. Then reconcile DECISIONS.md, HANDOFF-INDEX.md, and the obsolete publication/capture gates
in launch-packet-v0.1.5.md using the pending entries below. Preserve all existing changes.
Do not restore obsolete binary paths, replace installed extensions, or recreate VSCodeCPHDemo.app.

Review pending demo code/test changes separately before committing them. They are not covered
by a records-only wrapup. No push, merge, release, new post, reply, paid promotion, or scheduled
monitoring without separate approval. Reddit must be submitted manually by the owner.

## Current outcome

- Public repository: https://github.com/aijoe1/codex-project-history
- v0.1.5 release already published; do not republish it.
- GitHub issue reply: https://github.com/openai/codex/issues/25319#issuecomment-5594914552
- X launch: https://x.com/nightlydaytrade/status/2097857090358329527
- Displayed X publication time: September 9, 2026 at 21:18 EDT.
- User selected draft option 1 and explicitly approved publication with the final video.
- Approved media: docs/media/project-chats-button-demo-pullback-v0.1.5.mp4, 11.1 seconds, silent.
  Synthetic click/group/search demo with full-window pull-back; not proof of real-chat reopening.
- Owner confirmed real operation across workspaces and on another Mac via dotup.
- Early X snapshot at approximately 22:02 EDT: 15 views, 2 likes, 1 reply, 0 reposts/bookmarks.
- Reply question: https://x.com/FlorinIluta/status/2097866989708468609
  "Does it pick up old chats automatically?"

## Owner reply (independently read back September 10, 19:52 EDT)

Published response: https://x.com/nightlydaytrade/status/2097871379668365819

Do not send this response again:

> Yes, it reads existing unarchived chats created in the Codex VS Code extension automatically. No import needed.
>
> Chats for the project open in your current VS Code workspace will appear first, with repo and branch labels so you can tell them apart. Other projects are grouped below it. It shows up to 300 recent chats by default.

## Pending measurements and distribution

Manual 24-hour review: September 10, 2026 at approximately 21:18 EDT. Then September 16 and
October 9 for 7/30-day checks. Nothing scheduled. Count actual replies and reported installs;
stars/downloads are not installations, and GitHub activity cannot all be attributed to X.

Reddit draft and rules receipt are in launch-followup-v0.1.5.md. r/codex rules were read in the
logged-in browser; rule 9 says not to use bots. Owner should review and submit manually, after
checking recent duplicates, current flair, and additional composer rules. Nothing uploaded there.

## Save-helper diagnosis

Updating existing files fails at the filesystem helper launching removed version
`openai.chatgpt-26.901.22334-darwin-arm64/bin/macos-aarch64/codex`.
Installed version is 26.903.61454; its binary runs and reports Codex 0.153.4.
Add-only apply_patch succeeds and new files were read back from disk. This is partial functionality,
not a repaired helper. No editor reload or binary/permission modification was performed to fix it.
Recommend restarting the affected session and testing a real existing-file patch before claiming
recovery. X upload permission was a separate problem: owner enabled browser file-URL access and
video upload then succeeded. Do not conflate these failures.

## Pending shared-record entries

For DECISIONS.md:

### 2026-09-09 - X launch followed by evidence-led, manual Reddit distribution `ACTIVE`

**What:** Publish the explicitly approved question-led X post and synthetic status-bar demo;
review early feedback before broader distribution. Prepare Reddit content for manual submission.

**Why:** Specific workflow pain and a visible picker demo communicate the utility without novelty
claims. r/codex rule 9 prohibits bots; its rules favor detailed, useful showcases.

**Impact:** Owner reports answering the first X question. No further replies/publication approved.
Measurement targets are manual; records remain local until separate push approval.

For HANDOFF-INDEX.md:

2026-09-09 22:21 EDT | [codex] | Preserved approved X launch, final demo, early feedback and owner-reported reply in new handoff files | Shared-record updates blocked by stale existing-file helper; reconcile records and review pending demo changes in fresh session. Reddit manual-only; no monitoring or new publication authorized.

## Dirty worktree boundary

Earlier modifications remain in DECISIONS.md, HANDOFF-INDEX.md, demo/README.md,
demo/setup-fixture.sh, docs/briefs/demo-capture.md, docs/research/opportunity.md, and
test/history.test.js. Historical launch packet and capture review, plus earlier video edits, may
also remain untracked. Preserve them. Do not call the worktree clean or stage everything blindly.
Only new launch/handoff records and the approved final video belong in this records-only commit.

Wrapup is incomplete until the required shared records are reconciled. Verify commit status live;
do not infer a commit or push from this file's presence.
