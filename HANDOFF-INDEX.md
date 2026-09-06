# Handoff Index

One chronological line per completed or paused agent session:

`YYYY-MM-DD HH:MM | [claude|codex] | what changed | what remains / next step`

2026-09-05 15:02 | [codex] | Rebuilt the unpublished release with synthetic demo/test IDs and SQLite/Git timeouts; 22 tests, real local read, generated fixture smoke, VSIX/source comparison, and secret scan passed | Public repository creation and fresh editor activation of this revision remain pending; brief synchronous pauses are still possible.

2026-09-06 04:04 | [codex] | Isolated VSIX activation, status bar, keyboard shortcut, grouping, search, and actual window reload passed with an initialized synthetic database; recorded checksum and screenshots; normal installation unchanged | Bundled minimal demo schema fails official Codex initialization and needs a compatible fixture workflow before sharing; real-chat reopening and publication were not tested/performed. See docs/reviews/2026-09-06-isolated-activation.md.

2026-09-06 04:42 | [codex] | Replaced the minimal demo table with official-runtime schema initialization, added isolated setup coverage, rebuilt the VSIX, and repeated installed activation/search/reload successfully with refreshed evidence | Publication remains unperformed; synthetic fixtures intentionally do not validate real-chat reopening. See docs/reviews/2026-09-06-isolated-activation.md.

2026-09-06 05:03 | [codex] | Published public GitHub repository and v0.1.4 release; exact main/tag commit, two-platform CI, public release metadata, and downloaded VSIX SHA-256 were verified | VS Code Marketplace publication remains deferred; next approved distribution step is the pinned private dotfiles vendor receipt.
