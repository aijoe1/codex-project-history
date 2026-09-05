# Privacy-safe demo capture

Run `bash demo/setup-fixture.sh`. It creates a temporary workspace and Codex-shaped SQLite fixture
containing only fictional repositories, chat titles, and synthetic IDs, then prints the VS Code
launch command. These fixture entries are for demonstrating the picker, not opening real chats.

Capture an 8 to 15 second clip:

1. Start on a simple card reading: `Recent chats look alike across projects.`
2. Press **Control+Command+H**.
3. Pause on the current-project-first group, branch, and path labels.
4. Type `deploy` to demonstrate filtering.
5. End on: `Local. Read-only. Project-aware.`

Before sharing, inspect every frame for usernames, notifications, tabs, private repository names,
or local paths. The fixture path under the system temporary directory is safe to show.
