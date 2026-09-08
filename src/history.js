"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const STATE_DB_PATTERN = /^state_(\d+)\.sqlite$/;
const SQLITE_TIMEOUT_MS = 2000;
const GIT_TIMEOUT_MS = 1000;

function candidateStateDatabases(codexHome) {
  let entries;
  try {
    entries = fs.readdirSync(codexHome, { withFileTypes: true });
  } catch (error) {
    throw new Error(`cannot inspect ${codexHome}: ${error.message}`);
  }

  return entries
    .filter((entry) => entry.isFile() && STATE_DB_PATTERN.test(entry.name))
    .map((entry) => ({
      path: path.join(codexHome, entry.name),
      version: Number(entry.name.match(STATE_DB_PATTERN)[1]),
    }))
    .sort((a, b) => b.version - a.version)
    .map((entry) => entry.path);
}

function clampLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 300;
  return Math.max(25, Math.min(1000, Math.floor(parsed)));
}

function chatQuery(limit) {
  return `
SELECT
  id,
  COALESCE(NULLIF(name, ''), NULLIF(preview, ''), NULLIF(title, ''), 'Untitled chat') AS display_title,
  cwd,
  COALESCE(git_branch, '') AS git_branch,
  COALESCE(git_origin_url, '') AS git_origin_url,
  CASE WHEN recency_at > 0 THEN recency_at ELSE updated_at END AS last_used_at
FROM threads
WHERE archived = 0
  AND source = 'vscode'
  AND COALESCE(thread_source, '') IN ('', 'user')
ORDER BY last_used_at DESC
LIMIT ${clampLimit(limit)};
`.trim();
}

function codexSqliteHome(environment = process.env, homeDirectory = os.homedir()) {
  const configured = environment.CODEX_SQLITE_HOME || environment.CODEX_HOME;
  return path.resolve(configured || path.join(homeDirectory, ".codex"));
}

function sqliteErrorMessage(error) {
  if (error?.code === "ETIMEDOUT") {
    return `SQLite read timed out after ${SQLITE_TIMEOUT_MS} ms`;
  }
  const decode = (value) => {
    if (Buffer.isBuffer(value)) return value.toString("utf8");
    return typeof value === "string" ? value : "";
  };
  const stderr = decode(error && error.stderr).trim();
  const stdout = decode(error && error.stdout).trim();
  let message = stderr || stdout || (error && error.message) || String(error);
  const sqliteLine = message
    .split(/\r?\n/)
    .reverse()
    .find((line) => /^Error:/i.test(line.trim()));
  if (sqliteLine) message = sqliteLine;
  const compact = message.replace(/^Error:\s*/i, "").replace(/\s+/g, " ").trim();
  return compact.length > 320 ? `${compact.slice(0, 319).trimEnd()}…` : compact;
}

function isTimeout(error) {
  return error?.code === "ETIMEDOUT";
}

function isCantOpen(error) {
  return /unable to open database file(?:\s*\(14\))?/i.test(sqliteErrorMessage(error));
}

function walSidecarsAbsent(database) {
  return ["-wal", "-shm"].every((suffix) => {
    try {
      fs.lstatSync(`${database}${suffix}`);
      return false;
    } catch (error) {
      return error && error.code === "ENOENT";
    }
  });
}

function immutableDatabaseUri(database) {
  const uri = pathToFileURL(database);
  uri.searchParams.set("mode", "ro");
  uri.searchParams.set("immutable", "1");
  return uri.href;
}

function queryChats(database, query, run, immutable = false) {
  const target = immutable ? immutableDatabaseUri(database) : database;
  const output = run("/usr/bin/sqlite3", ["-readonly", "-json", target, query], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
    timeout: SQLITE_TIMEOUT_MS,
    killSignal: "SIGKILL",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  const rows = output === "" ? [] : JSON.parse(output);
  return rows.filter((row) => row.id && row.cwd);
}

function loadChats({ codexHome, maxChats = 300, run = execFileSync, onDiagnostic = () => {} }) {
  const databases = candidateStateDatabases(codexHome);
  if (databases.length === 0) {
    throw new Error(`no state_*.sqlite database exists under ${codexHome}`);
  }

  const query = chatQuery(maxChats);
  const failures = [];
  for (const database of databases) {
    try {
      return queryChats(database, query, run);
    } catch (error) {
      if (isTimeout(error)) {
        throw new Error(`${path.basename(database)}: ${sqliteErrorMessage(error)}`);
      }
      if (isCantOpen(error) && walSidecarsAbsent(database)) {
        try {
          const snapshot = queryChats(database, query, run, true);

          // A writer may have started between the failed normal open and the
          // immutable read. If sidecars appeared, prefer a fresh WAL-aware read
          // rather than returning a snapshot that intentionally ignores them.
          if (!walSidecarsAbsent(database)) {
            const liveRows = queryChats(database, query, run);
            onDiagnostic(
              `${path.basename(database)} recovered after Codex recreated its WAL sidecars.`,
            );
            return liveRows;
          }

          onDiagnostic(
            `${path.basename(database)} used a read-only immutable retry because its WAL sidecars were absent.`,
          );
          return snapshot;
        } catch (retryError) {
          if (isTimeout(retryError)) {
            throw new Error(`${path.basename(database)}: ${sqliteErrorMessage(retryError)}`);
          }
          failures.push(
            `${path.basename(database)}: ${sqliteErrorMessage(error)}; immutable retry: ${sqliteErrorMessage(retryError)}`,
          );
          continue;
        }
      }
      failures.push(`${path.basename(database)}: ${sqliteErrorMessage(error)}`);
    }
  }

  throw new Error(`no compatible Codex state database found (${failures.join("; ")})`);
}

function normalized(value) {
  return path.resolve(value || path.parse(process.cwd()).root);
}

function pathContains(parent, child) {
  const relative = path.relative(normalized(parent), normalized(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function repositorySlug(originUrl) {
  if (!originUrl) return null;
  const withoutQuery = originUrl.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  const last = withoutQuery.split(/[/:]/).filter(Boolean).pop();
  return last ? last.replace(/\.git$/i, "") : null;
}

function repositoryKey(originUrl) {
  if (!originUrl) return null;
  const clean = originUrl.trim();
  const normalizeRepositoryPath = (value) =>
    value.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "").replace(/\.git$/i, "");
  const scpStyle = clean.match(/^(?:[^@]+@)?([^:]+):(.+)$/);
  if (scpStyle && !clean.includes("://")) {
    return `${scpStyle[1].toLowerCase()}/${normalizeRepositoryPath(scpStyle[2])}`;
  }
  try {
    const parsed = new URL(clean);
    return `${parsed.host.toLowerCase()}/${normalizeRepositoryPath(parsed.pathname)}`;
  } catch {
    return normalizeRepositoryPath(clean);
  }
}

function repositoryLabel(originUrl) {
  const key = repositoryKey(originUrl);
  if (!key) return null;
  const parts = key.split("/").filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join("/") : key;
}

function workspaceProjectKeys(roots, run = execFileSync) {
  const keys = new Set();
  for (const root of roots) {
    try {
      const originUrl = run(
        "/usr/bin/git",
        ["-C", root, "config", "--get", "remote.origin.url"],
        {
          encoding: "utf8",
          maxBuffer: 1024 * 1024,
          timeout: GIT_TIMEOUT_MS,
          killSignal: "SIGKILL",
          stdio: ["ignore", "pipe", "pipe"],
        },
      ).trim();
      const key = repositoryKey(originUrl);
      if (key) keys.add(`git:${key}`);
    } catch {
      // Non-Git workspace roots still match chats through their working directory.
    }
  }
  return keys;
}

function projectIdentity(chat) {
  const label = repositoryLabel(chat.git_origin_url);
  const repoKey = repositoryKey(chat.git_origin_url);
  if (label && repoKey) return { key: `git:${repoKey}`, label };
  return { key: `cwd:${normalized(chat.cwd)}`, label: path.basename(normalized(chat.cwd)) };
}

function organizeChats(chats, roots = [], currentProjectKeys = []) {
  const currentKeys = new Set(currentProjectKeys);
  const groups = new Map();
  for (const chat of chats) {
    const project = projectIdentity(chat);
    const current =
      currentKeys.has(project.key) ||
      roots.some(
        (root) =>
          normalized(root) === normalized(chat.cwd) ||
          (!project.key.startsWith("git:") && pathContains(root, chat.cwd)),
      );
    const existing = groups.get(project.key) || {
      key: project.key,
      label: project.label,
      current: false,
      latest: 0,
      chats: [],
    };
    existing.current ||= current;
    existing.latest = Math.max(existing.latest, Number(chat.last_used_at || 0));
    existing.chats.push(chat);
    groups.set(project.key, existing);
  }

  const grouped = Array.from(groups.values());
  const labelCounts = new Map();
  for (const group of grouped) {
    labelCounts.set(group.label, (labelCounts.get(group.label) || 0) + 1);
  }

  return grouped
    .map((group) => ({
      ...group,
      label:
        group.key.startsWith("git:") && labelCounts.get(group.label) > 1
          ? group.key.slice("git:".length)
          : group.label,
      chats: group.chats.sort(
        (a, b) => Number(b.last_used_at || 0) - Number(a.last_used_at || 0),
      ),
    }))
    .sort((a, b) => Number(b.current) - Number(a.current) || b.latest - a.latest);
}

function buildCodexThreadUri(threadId) {
  if (!/^[0-9a-f-]{36}$/i.test(threadId || "")) throw new Error("invalid Codex chat ID");
  return `openai-codex://route/local/${threadId}`;
}

function shorten(value, maxLength) {
  const singleLine = String(value || "Untitled chat").replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

module.exports = {
  buildCodexThreadUri,
  candidateStateDatabases,
  chatQuery,
  clampLimit,
  codexSqliteHome,
  immutableDatabaseUri,
  loadChats,
  organizeChats,
  pathContains,
  projectIdentity,
  repositoryLabel,
  repositorySlug,
  repositoryKey,
  shorten,
  sqliteErrorMessage,
  walSidecarsAbsent,
  workspaceProjectKeys,
};
