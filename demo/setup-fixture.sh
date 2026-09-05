#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEMO_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/codex-project-history-demo.XXXXXX")"
WORKSPACE="$DEMO_ROOT/projects/acme-dashboard"
STATE_ROOT="$DEMO_ROOT/codex-state"

mkdir -p "$WORKSPACE" "$STATE_ROOT"
git -C "$WORKSPACE" init -q
git -C "$WORKSPACE" remote add origin https://github.com/example/acme-dashboard.git

/usr/bin/sqlite3 "$STATE_ROOT/state_5.sqlite" <<SQL
CREATE TABLE threads (
  id TEXT, name TEXT, preview TEXT, title TEXT, cwd TEXT,
  git_branch TEXT, git_origin_url TEXT, recency_at INTEGER,
  updated_at INTEGER, archived INTEGER, source TEXT, thread_source TEXT
);
INSERT INTO threads VALUES
  ('00000000-0000-4000-8000-000000000001', 'Fix the failing deploy', '', '', '$WORKSPACE', 'main', 'https://github.com/example/acme-dashboard.git', 1770000300, 1770000300, 0, 'vscode', 'user'),
  ('00000000-0000-4000-8000-000000000002', 'Review authentication flow', '', '', '$WORKSPACE', 'feat/auth-review', 'https://github.com/example/acme-dashboard.git', 1770000200, 1770000200, 0, 'vscode', 'user'),
  ('00000000-0000-4000-8000-000000000003', 'Fix the failing deploy', '', '', '$DEMO_ROOT/projects/storefront', 'release', 'https://github.com/example/storefront.git', 1770000100, 1770000100, 0, 'vscode', 'user');
SQL

cat <<OUT
Privacy-safe demo fixture created at:
  $DEMO_ROOT

Launch an Extension Development Host with:
  CODEX_SQLITE_HOME="$STATE_ROOT" code --extensionDevelopmentPath="$REPO_ROOT" "$WORKSPACE"

Then press Control+Command+H. Delete the temporary demo directory when capture is complete.
OUT
