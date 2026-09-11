# Launch follow-up, September 9, 2026

This record supersedes the historical unapproved X draft/gate in launch-packet-v0.1.5.md.
X is published: https://x.com/nightlydaytrade/status/2097857090358329527
Exact approved copy and media checksum: [launch receipt](x-launch-receipt.md).

## Early feedback

Observed approximately 22:02 EDT, 44 minutes after publication: 15 views, 2 likes, 1 reply,
0 reposts, 0 bookmarks. Reply: https://x.com/FlorinIluta/status/2097866989708468609
It asks whether old chats are picked up automatically. The owner subsequently reported replying
that existing unarchived VS Code chats load automatically, current-workspace chats appear first,
repo/branch labels distinguish projects, and the default limit is 300. The complete reply was
independently read back September 10 at 19:52 EDT:
https://x.com/nightlydaytrade/status/2097871379668365819. Do not send it again. Exact text is in
NEXT-SESSION.md.

Interim public-view observation September 10 at 19:52 EDT, 22 hours 34 minutes after publication:
57 views and one outside reply. The logged-out view rendered zero for likes, reposts, and bookmarks,
which conflicts with the earlier two-like observation. Treat those interaction counts as unresolved
until the signed-in 24-hour checkpoint rather than inferring that engagement disappeared.

## Late 24-hour X checkpoint

Observed in signed-in X analytics September 10 at 23:34 EDT, 26 hours 16 minutes after publication:

- 59 impressions, 7 engagements, 2 detail expands, 0 profile visits, and 1 link click;
- 2 likes, 1 outside reply, 0 reposts, and 0 visible bookmarks;
- 22 unique video views and 23 total video views; and
- audience retention of 96% at 2 seconds, 70% at 5 seconds, 43% at 8 seconds, and 39% at the
  11-second ending.

The owner's answer had 12 views and 1 like. There were no additional questions, public install
confirmations, failures, or bugs. The one outside question is `positioning/onboarding` feedback;
the README now states that existing unarchived chats load automatically without import and that the
default limit is 300. The derived engagement rate is approximately 11.9% and the link-click rate is
approximately 1.7%, but the 59-impression sample is too small for a product conclusion.

Decision: `MAINTAIN`. Do not change product scope or pay to promote this post from this result.
The owner manually attempted the r/codex distribution experiment on September 10, but Reddit's
automated filters immediately removed it. This is a distribution failure, not a demand result.
The owner separately approved one Modmail appeal, which was sent September 11 at approximately
00:38 EDT and verified by Reddit's `Message sent` confirmation. An immediate automated reply cited
0 r/Codex comment karma as the probable removal cause and a minimum of 1 for moderator responses,
while also claiming detailed helpful posts are exempt. Treat this as an unresolved distribution
gate. Review cumulative signals again September 16.

## Manual measurement plan

The X clock starts at its September 9, 21:18 EDT publication. The first checkpoint was captured
late at 26 hours 16 minutes; review again September 16 (7 days) and October 9 (30 days). The GitHub issue-reply clock starts at
September 8, 22:35:58 EDT; its 24-hour checkpoint was missed, so the September 10 observation is a
late first baseline rather than 24-hour growth. No monitoring is scheduled. Record timestamp and
elapsed time with each observation.

- Record X views, likes, replies, reposts, and bookmarks from the actual post.
- Count distinct people reporting the same problem and explicitly confirmed install successes/failures.
- Record GitHub stars and release downloads; launch baseline is unknown. First observation is a
  baseline, not proof of launch-attributable growth. Downloads and stars are not installations.
- Link clicks are unknown unless accessible analytics exposes them. No tracking was added.
- Classify feedback as bug, missing use case, positioning, distribution, or noise.
- Prioritize reproducible failures. Low reach does not disprove demand; do not attribute all
  GitHub activity to X because the GitHub issue reply and other discovery paths also exist.
- Do not start a Reddit measurement clock unless public visibility is independently confirmed.

## GitHub late baseline

Observed September 10 at approximately 19:52 EDT, about 45 hours 16 minutes after the issue reply,
and refreshed at 23:34 EDT with no change:
one v0.1.5 asset download, zero stars, forks, and watchers, no repository issues, and zero reactions
on the OpenAI issue reply. This is a late baseline with no attributable installation outcome.

## Reddit rules receipt

Read the rendered logged-in https://www.reddit.com/r/codex/about/rules/ on September 9 EDT and
rechecked the relevant rules after the September 10 submission.
Rules 2/3 require relevant detailed content; rule 7 asks to check existing posts; rule 8 requires
appropriate flair; rule 9 says "Don't use bots." The owner submitted manually.
No explicit blanket self-promotion ban appeared in the ten rules inspected; this is not moderator
approval. Rule 4 says Showcase and high-effort useful posts are exempt from its low-karma delay
rule. Rule 5 says automated moderation can make mistakes and directs authors to Modmail.

## Reddit submission r3 — filtered

The owner manually submitted the final revised copy with `Showcase` flair and the approved video
at approximately September 10, 23:56 EDT. Reddit created the post URL but immediately reported
that its filters removed the post. Exact copy, URL, media checksum, UI verification, and the
measurement boundary are in [the Reddit launch attempt receipt](reddit-launch-receipt.md).

Do not repost or reply again now. Participate genuinely in r/Codex first; after the account shows
at least 1 r/Codex comment karma, recheck the original post and request human review only if it is
still filtered.

## Technical handoff (resolved September 9, 23:35 EDT)

An existing-file apply_patch to DECISIONS.md now succeeded and was read back in the Git diff.
Records are being reconciled in this session; restarting or replacing installed binaries was
not necessary for this successful retry. This proves current editing works, not the underlying
cause of the earlier helper failure. The diagnosis below is retained as historical evidence.

Earlier patch failures invoke removed extension version 26.901.22334. Installed version is
26.903.61454; its Codex 0.153.4 executable runs. An add-only patch created x-launch-receipt.md,
verified by reading the actual file. A subsequent patch updating existing files still failed at
the stale filesystem helper. Therefore saving new files worked, but existing-file editing is
not repaired. No editor reload, permission change, or binary replacement was performed.

Launch and shared records have been reconciled; consult Git for their commit status.
Do not reinstall Project Chats or restore obsolete executable paths as a workaround.
No monitoring, replies, repost, additional Modmail message, push, or paid promotion is authorized.
