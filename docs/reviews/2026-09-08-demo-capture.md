# Demo preparation and capture status

Historical status on September 8: fixture preparation verified; this capture attempt incomplete.
September 9 update: the owner subsequently supplied recordings and approved the final status-bar
demo with full-window pullback, now recorded in `../briefs/x-launch-receipt.md`. The failed attempt
below remains incident evidence, not a current media blocker. The published VSIX is unchanged.

The standard VS Code launch initially exited without a window. Verbose startup output reported
that the Unix-domain IPC socket exceeded the 103-character limit. The demo setup now prints
`--new-window` and a separate short `/tmp/cph-vscode.*` user-data directory alongside its existing
disposable Codex environment. This is a local change awaiting commit; the published v0.1.5 artifact
has not been replaced.

An attempted automation workaround copied VS Code, changed the copy's app identity, and signed
that temporary copy locally. The copy crashed and produced repeated macOS crash dialogs when
reopened. That was an agent-created capture failure. The exact cause of the copied app's crash was
not established; it is separate from the diagnosed IPC path-length failure. The copied app,
its processes, and its private directories were removed. A shutdown-created residual cache was
subsequently removed after confirming no matching demo processes remained.

Do not repeat the copied-app workaround. Use the installed, unmodified VS Code app with the
fixture command. If automation cannot address that instance, follow the manual recording steps in
`docs/briefs/demo-capture.md`. No usable screenshot, clip, or visual acceptance result was produced
by this capture attempt.

## Evidence

- Existing suite after the demo-script changes: 25 tests passed; syntax checks passed.
- Final shell syntax checks and `git diff --check`: passed.
- Fresh fixture initialized by the installed official Codex runtime: direct SQLite inspection
  returned 3 chats, 2 repository origins, and exactly the 3 expected synthetic IDs.
- Generated user-data socket example: 37 bytes, below the observed 103-character limit.
- The fresh fixture check did not launch an editor or open any chat.
- These checks prove fixture preparation and launch-command construction. They do not prove
  visual grouping, filtering, recording quality, or real-chat reopening in this attempt.

## Next (historical at time of this attempt)

The GitHub issue reply in `docs/briefs/launch-packet-v0.1.5.md` can be reviewed independently of
the recording. X media remains incomplete. Publication, commit, and push are still pending.
