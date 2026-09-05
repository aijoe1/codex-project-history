#!/usr/bin/env bash
set -euo pipefail

# Resolve the physical checkout before touching a versioned install target. The
# setup-managed extension directory may itself be a symlink to this source; if
# ROOT stayed logical, backing up TARGET below would also remove our copy source.
ROOT="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
VERSION="$(node -p 'require(process.argv[1]).version' "$ROOT/package.json")"
TARGET="${CODEX_HISTORY_EXTENSION_DIR:-$HOME/.vscode/extensions/aijoe1.codex-project-history-$VERSION}"
EXTENSIONS_DIR="$(dirname "$TARGET")"
BACKUP_ROOT="${CODEX_HISTORY_EXTENSION_BACKUP_DIR:-$HOME/.local/state/codex-project-history/extension-backups}"

mkdir -p "$EXTENSIONS_DIR" "$BACKUP_ROOT"
EXTENSIONS_DIR="$(cd "$EXTENSIONS_DIR" && pwd)"
BACKUP_ROOT="$(cd "$BACKUP_ROOT" && pwd)"
TARGET="$EXTENSIONS_DIR/$(basename "$TARGET")"

case "$BACKUP_ROOT/" in
  "$EXTENSIONS_DIR/"*)
    echo "ERROR: backup directory must be outside VS Code's extension directory" >&2
    exit 2
    ;;
esac

backup_installation() {
  local source="$1" backup
  backup="$BACKUP_ROOT/$(basename "$source").backup-$(date +%Y%m%d-%H%M%S)-$$"
  mv "$source" "$backup"
  echo "BACKUP  $source -> $backup"
}

if [ -e "$TARGET" ] || [ -L "$TARGET" ]; then
  backup_installation "$TARGET"
fi

# VS Code scans every direct child here. Relocate older versions and backups so
# only the newly installed version can satisfy this extension identifier.
for candidate in "$EXTENSIONS_DIR"/aijoe1.codex-project-history-*; do
  [ -e "$candidate" ] || [ -L "$candidate" ] || continue
  backup_installation "$candidate"
done

mkdir -p "$TARGET"
cp -R "$ROOT/package.json" "$ROOT/extension.js" "$ROOT/src" "$TARGET/"
echo "INSTALL $TARGET"
echo "Reload VS Code, then run: Codex: Search Chats by Project"
