# Launch follow-up, September 9, 2026

This record supersedes the historical unapproved X draft/gate in launch-packet-v0.1.5.md.
X is published: https://x.com/nightlydaytrade/status/2097857090358329527
Exact approved copy and media checksum: [launch receipt](x-launch-receipt.md).

## Early feedback

Observed approximately 22:02 EDT, 44 minutes after publication: 15 views, 2 likes, 1 reply,
0 reposts, 0 bookmarks. Reply: https://x.com/FlorinIluta/status/2097866989708468609
It asks whether old chats are picked up automatically. The owner subsequently reported replying
that existing unarchived VS Code chats load automatically, current-workspace chats appear first,
repo/branch labels distinguish projects, and the default limit is 300. This reply was not
independently read back; do not send it again. Exact owner-reported text is in NEXT-SESSION.md.

## Manual measurement plan

Review September 10 at 21:18 EDT (24 hours), September 16 (7 days), and October 9 (30 days).
No monitoring is scheduled. Record timestamp and elapsed time with each observation.

- Record X views, likes, replies, reposts, and bookmarks from the actual post.
- Count distinct people reporting the same problem and explicitly confirmed install successes/failures.
- Record GitHub stars and release downloads; launch baseline is unknown. First observation is a
  baseline, not proof of launch-attributable growth. Downloads and stars are not installations.
- Link clicks are unknown unless accessible analytics exposes them. No tracking was added.
- Classify feedback as bug, missing use case, positioning, distribution, or noise.
- Prioritize reproducible failures. Low reach does not disprove demand; do not attribute all
  GitHub activity to X because the GitHub issue reply and other discovery paths also exist.

## Reddit rules receipt

Read the rendered logged-in https://www.reddit.com/r/codex/about/rules/ on September 9 EDT.
Rules 2/3 require relevant detailed content; rule 7 asks to check existing posts; rule 8 requires
appropriate flair; rule 9 says "Don't use bots." Owner should review and submit manually.
No explicit blanket self-promotion ban appeared in the ten rules inspected; this is not moderator
approval. Recheck recent similar posts, available showcase flair, and submit-time rules before posting.

## Reddit draft r2 — unpublished

Title: **I built a project-first chat picker for Codex in VS Code (macOS, open source)**

I use Codex across several VS Code projects. Finding an older chat meant opening threads one by
one to figure out which repo they belonged to.

I built Project Chats to make that easier. Click **Project Chats** in the status bar or press
**Control+Command+H**. It groups chats by repo, puts the current workspace first, and shows the
branch and working directory before you open a thread.

I am the author. Source and installation instructions:
https://github.com/aijoe1/codex-project-history

It reads local metadata without modifying chat history. It is macOS-only, installs through GitHub,
and relies on undocumented Codex internals that could change.

I tested it across my workspaces and on a second Mac. The attached demo uses fictional chats to
show grouping and filtering, not real-chat reopening.

If you use multi-root workspaces or Git worktrees, does it put the right project first? Please
remove private paths and chat titles from screenshots or diagnostics.

Attachment if owner submits: ../media/project-chats-button-demo-pullback-v0.1.5.mp4.
No Reddit upload or submission performed. Test statements above are owner-reported.

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
No monitoring, replies, new publication, push, or paid promotion is authorized.
