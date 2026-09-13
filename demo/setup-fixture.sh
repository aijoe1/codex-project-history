#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This demo currently supports macOS only." >&2
  exit 1
fi
if [[ ! -x /usr/bin/sqlite3 ]]; then
  echo "This demo requires /usr/bin/sqlite3." >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "This demo requires Node.js." >&2
  exit 1
fi

resolve_codex_binary() {
  if [[ -n "${CODEX_PROJECT_HISTORY_CODEX_BIN:-}" ]]; then
    if [[ ! -x "$CODEX_PROJECT_HISTORY_CODEX_BIN" ]]; then
      echo "CODEX_PROJECT_HISTORY_CODEX_BIN is not executable: $CODEX_PROJECT_HISTORY_CODEX_BIN" >&2
      return 1
    fi
    printf '%s\n' "$CODEX_PROJECT_HISTORY_CODEX_BIN"
    return
  fi

  if ! command -v code >/dev/null 2>&1; then
    echo "Could not find the VS Code 'code' command. Install it or set CODEX_PROJECT_HISTORY_CODEX_BIN." >&2
    return 1
  fi

  local extension_dir architecture platform_dir candidate
  extension_dir="$(code --locate-extension openai.chatgpt 2>/dev/null || true)"
  if [[ -z "$extension_dir" ]]; then
    echo "Could not locate the official OpenAI Codex extension (openai.chatgpt)." >&2
    return 1
  fi

  architecture="$(uname -m)"
  case "$architecture" in
    arm64) platform_dir="macos-aarch64" ;;
    x86_64) platform_dir="macos-x86_64" ;;
    *)
      echo "Unsupported macOS architecture for the demo: $architecture" >&2
      return 1
      ;;
  esac
  candidate="$extension_dir/bin/$platform_dir/codex"
  if [[ ! -x "$candidate" ]]; then
    echo "The official OpenAI extension does not contain the expected Codex binary: $candidate" >&2
    return 1
  fi
  printf '%s\n' "$candidate"
}

CODEX_BIN="$(resolve_codex_binary)"

if [[ -n "${CODEX_PROJECT_HISTORY_DEMO_ROOT:-}" ]]; then
  DEMO_ROOT="$CODEX_PROJECT_HISTORY_DEMO_ROOT"
  if [[ -e "$DEMO_ROOT" ]]; then
    echo "CODEX_PROJECT_HISTORY_DEMO_ROOT must not already exist: $DEMO_ROOT" >&2
    exit 1
  fi
  mkdir -p "$DEMO_ROOT"
else
  TEMP_BASE="${TMPDIR:-/tmp}"
  DEMO_ROOT="$(mktemp -d "${TEMP_BASE%/}/codex-project-history-demo.XXXXXX")"
fi
WORKSPACE="$DEMO_ROOT/projects/acme-dashboard"
STOREFRONT="$DEMO_ROOT/projects/storefront"
CODEX_HOME_DIR="$DEMO_ROOT/codex-home"
STATE_ROOT="$DEMO_ROOT/codex-state"
ARCHIVE_DIR="$CODEX_HOME_DIR/archived_sessions"

# VS Code places its macOS IPC socket under the user-data directory and rejects socket paths
# longer than 103 characters. TMPDIR is commonly too long, so keep this separate root under /tmp.
if [[ -n "${CODEX_PROJECT_HISTORY_VSCODE_USER_DATA:-}" ]]; then
  VSCODE_USER_DATA="$CODEX_PROJECT_HISTORY_VSCODE_USER_DATA"
  if [[ -e "$VSCODE_USER_DATA" ]]; then
    echo "CODEX_PROJECT_HISTORY_VSCODE_USER_DATA must not already exist: $VSCODE_USER_DATA" >&2
    exit 1
  fi
  mkdir -p "$VSCODE_USER_DATA"
else
  VSCODE_USER_DATA="$(mktemp -d /tmp/cph-vscode.XXXXXX)"
fi

mkdir -p "$WORKSPACE" "$STOREFRONT" "$ARCHIVE_DIR" "$STATE_ROOT"
git -C "$WORKSPACE" init -q
git -C "$WORKSPACE" remote add origin https://github.com/example/acme-dashboard.git
git -C "$STOREFRONT" init -q
git -C "$STOREFRONT" remote add origin https://github.com/example/storefront.git

STATE_DATABASE="$(node "$REPO_ROOT/demo/initialize-state.cjs" "$CODEX_BIN" "$CODEX_HOME_DIR" "$STATE_ROOT")"

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

WORKSPACE_SQL="$(sql_escape "$WORKSPACE")"
STOREFRONT_SQL="$(sql_escape "$STOREFRONT")"
DEMO_ROOT_SQL="$(sql_escape "$DEMO_ROOT")"
ARCHIVE_SQL="$(sql_escape "$ARCHIVE_DIR/rollout-00000000-0000-4000-8000-000000000004.jsonl")"
NOW="$(date +%s)"

cat >"$ARCHIVE_DIR/rollout-00000000-0000-4000-8000-000000000004.jsonl" <<'JSONL'
{"type":"session_meta","payload":{"id":"00000000-0000-4000-8000-000000000004"}}
{"type":"response_item","payload":{"type":"message","role":"developer","content":[{"type":"input_text","text":"Synthetic internal context must not appear."}]}}
{"type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":"<environment_context>synthetic context</environment_context>"},{"type":"input_text","text":"Summarize the release plan."}]}}
{"type":"response_item","payload":{"type":"message","role":"assistant","content":[{"type":"output_text","text":"The release plan is ready for review. This is a synthetic archived transcript."}]}}
JSONL

/usr/bin/sqlite3 "$STATE_DATABASE" <<SQL
BEGIN IMMEDIATE;
INSERT INTO threads (
  id, rollout_path, created_at, updated_at, source, model_provider, cwd,
  title, name, preview, sandbox_policy, approval_mode, has_user_event,
  archived, git_branch, git_origin_url, recency_at, thread_source
) VALUES
  ('00000000-0000-4000-8000-000000000001', '$DEMO_ROOT_SQL/synthetic-sessions/00000000-0000-4000-8000-000000000001.jsonl', $((NOW - 60)), $((NOW - 60)), 'vscode', 'openai', '$WORKSPACE_SQL', 'Fix the failing deploy', 'Fix the failing deploy', 'Fix the failing deploy', '{"type":"read-only"}', 'never', 1, 0, 'main', 'https://github.com/example/acme-dashboard.git', $((NOW - 60)), 'user'),
  ('00000000-0000-4000-8000-000000000002', '$DEMO_ROOT_SQL/synthetic-sessions/00000000-0000-4000-8000-000000000002.jsonl', $((NOW - 120)), $((NOW - 120)), 'vscode', 'openai', '$WORKSPACE_SQL', 'Review authentication flow', 'Review authentication flow', 'Review authentication flow', '{"type":"read-only"}', 'never', 1, 0, 'feat/auth-review', 'https://github.com/example/acme-dashboard.git', $((NOW - 120)), 'user'),
  ('00000000-0000-4000-8000-000000000003', '$DEMO_ROOT_SQL/synthetic-sessions/00000000-0000-4000-8000-000000000003.jsonl', $((NOW - 180)), $((NOW - 180)), 'vscode', 'openai', '$STOREFRONT_SQL', 'Fix the failing deploy', 'Fix the failing deploy', 'Fix the failing deploy', '{"type":"read-only"}', 'never', 1, 0, 'release', 'https://github.com/example/storefront.git', $((NOW - 180)), 'user'),
  ('00000000-0000-4000-8000-000000000004', '$ARCHIVE_SQL', $((NOW - 240)), $((NOW - 240)), 'vscode', 'openai', '$WORKSPACE_SQL', 'Plan the release notes', 'Plan the release notes', 'Plan the release notes', '{"type":"read-only"}', 'never', 1, 1, 'main', 'https://github.com/example/acme-dashboard.git', $((NOW - 240)), 'user');
COMMIT;
SQL

cat <<OUT
Privacy-safe demo fixture created at:
  $DEMO_ROOT

The official Codex runtime initialized the disposable state database:
  $STATE_DATABASE

Launch an Extension Development Host with:
OUT
printf '  CODEX_HOME=%q CODEX_SQLITE_HOME=%q code --new-window --user-data-dir=%q --extensionDevelopmentPath=%q %q\n\n' \
  "$CODEX_HOME_DIR" "$STATE_ROOT" "$VSCODE_USER_DATA" "$REPO_ROOT" "$WORKSPACE"
cat <<OUT
Use that exact command even when VS Code is already open. The short, isolated user-data directory
keeps the demo environment separate and avoids the macOS IPC socket-length limit.

Then press Control+Command+H for active chats, or run **Codex: Search Archived Chats by Project**
and open the synthetic archived chat. Its transcript is fictional and safe to display. Do not try
to restore it because the synthetic ID is not a real Codex session.
After closing the demo window, delete these temporary directories when capture is complete:
  $DEMO_ROOT
  $VSCODE_USER_DATA
OUT
