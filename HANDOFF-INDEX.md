# Handoff Index

2026-09-08 01:58 | [codex] | Published v0.1.5 from `96613a1` after macOS and Linux CI passed; downloaded the public VSIX and verified SHA-256 `98786cae70cd51d5ab7b6521195950905d6ad75d8db8e273f044264bbc5cb233` and the tag commit | Release is available on GitHub; release branch and dotfiles distribution PR await separate merge decisions. Marketplace and social publication remain deferred.

One chronological line per completed or paused agent session:

`YYYY-MM-DD HH:MM | [claude|codex] | what changed | what remains / next step`

2026-09-05 15:02 | [codex] | Rebuilt the unpublished release with synthetic demo/test IDs and SQLite/Git timeouts; 22 tests, real local read, generated fixture smoke, VSIX/source comparison, and secret scan passed | Public repository creation and fresh editor activation of this revision remain pending; brief synchronous pauses are still possible.

2026-09-06 04:04 | [codex] | Isolated VSIX activation, status bar, keyboard shortcut, grouping, search, and actual window reload passed with an initialized synthetic database; recorded checksum and screenshots; normal installation unchanged | Bundled minimal demo schema fails official Codex initialization and needs a compatible fixture workflow before sharing; real-chat reopening and publication were not tested/performed. See docs/reviews/2026-09-06-isolated-activation.md.

2026-09-06 04:42 | [codex] | Replaced the minimal demo table with official-runtime schema initialization, added isolated setup coverage, rebuilt the VSIX, and repeated installed activation/search/reload successfully with refreshed evidence | Publication remains unperformed; synthetic fixtures intentionally do not validate real-chat reopening. See docs/reviews/2026-09-06-isolated-activation.md.

2026-09-06 05:03 | [codex] | Published public GitHub repository and v0.1.4 release; exact main/tag commit, two-platform CI, public release metadata, and downloaded VSIX SHA-256 were verified | VS Code Marketplace publication remains deferred; next approved distribution step is the pinned private dotfiles vendor receipt.
2026-09-08 01:20 | [codex] | Prepared v0.1.5 in an isolated worktree: newest-database timeouts now fail visibly instead of returning stale history, npm publication is disabled with `private: true`, 25 tests and syntax checks pass, and the built VSIX exactly contains the reviewed runtime (SHA-256 `98786cae70cd51d5ab7b6521195950905d6ad75d8db8e273f044264bbc5cb233`) | LEFT: the public-repo diff is intentionally uncommitted/unpushed and the GitHub release is unpublished pending explicit approval; dotfiles PR #14 remains frozen until it can vendor the canonical release. NEXT: approve or defer the v0.1.5 commit, push, and GitHub release.
