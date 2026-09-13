"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);
const RESTORE_TIMEOUT_MS = 10_000;
const THREAD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function restoreErrorMessage(error) {
  if (error?.code === "ETIMEDOUT") {
    return `Codex restore timed out after ${RESTORE_TIMEOUT_MS / 1000} seconds`;
  }
  const stderr = Buffer.isBuffer(error?.stderr)
    ? error.stderr.toString("utf8")
    : String(error?.stderr || "");
  const message = (stderr || error?.message || String(error)).replace(/\s+/g, " ").trim();
  return message.length > 320 ? `${message.slice(0, 319).trimEnd()}…` : message;
}

function bundledCodexPath(
  extensionPath,
  { platform = process.platform, architecture = process.arch, exists = fs.existsSync } = {},
) {
  const platformDirectories = {
    "darwin:arm64": "macos-aarch64",
    "darwin:x64": "macos-x86_64",
  };
  const platformDirectory = platformDirectories[`${platform}:${architecture}`];
  if (!extensionPath || !platformDirectory) return null;
  const candidate = path.join(extensionPath, "bin", platformDirectory, "codex");
  return exists(candidate) ? candidate : null;
}

async function unarchiveChat(threadId, { binary = "codex", run = execFileAsync } = {}) {
  if (!THREAD_ID_PATTERN.test(threadId || "")) throw new Error("invalid Codex chat ID");
  try {
    await run(binary, ["unarchive", threadId], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
      timeout: RESTORE_TIMEOUT_MS,
      killSignal: "SIGKILL",
      windowsHide: true,
    });
  } catch (error) {
    throw new Error(restoreErrorMessage(error));
  }
}

module.exports = { RESTORE_TIMEOUT_MS, bundledCodexPath, restoreErrorMessage, unarchiveChat };
