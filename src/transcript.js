"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const readline = require("node:readline");

const MAX_RENDERED_CHARACTERS = 4_000_000;
const THREAD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INJECTED_USER_PREFIXES = [
  "<environment_context>",
  "<recommended_plugins>",
  "<skill>",
  "<permissions",
  "<collaboration_mode>",
  "<apps_instructions>",
  "<plugins_instructions>",
  "<multi_agent_mode>",
  "<skills_instructions>",
  "# AGENTS.md instructions",
];

function codexDataHome(environment = process.env, homeDirectory = os.homedir()) {
  return path.resolve(environment.CODEX_HOME || path.join(homeDirectory, ".codex"));
}

function pathContains(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveArchivedTranscript(chat, { sqliteHome, dataHome, realpath = fs.realpathSync }) {
  if (!chat || Number(chat.archived) !== 1) throw new Error("chat is not archived");
  if (!THREAD_ID_PATTERN.test(chat.id || "")) throw new Error("invalid Codex chat ID");
  if (!chat.rollout_path) throw new Error("archived chat has no transcript path");

  const candidate = path.resolve(chat.rollout_path);
  if (path.extname(candidate).toLowerCase() !== ".jsonl") {
    throw new Error("archived transcript is not a JSONL file");
  }
  if (!path.basename(candidate).toLowerCase().includes(chat.id.toLowerCase())) {
    throw new Error("archived transcript does not match the selected chat");
  }

  let resolvedCandidate;
  try {
    resolvedCandidate = realpath(candidate);
  } catch (error) {
    throw new Error(`cannot open archived transcript: ${error.message}`);
  }

  const allowedRoots = Array.from(
    new Set([sqliteHome, dataHome].filter(Boolean).map((root) => path.resolve(root))),
  )
    .map((root) => path.join(root, "archived_sessions"))
    .map((root) => {
      try {
        return realpath(root);
      } catch {
        return root;
      }
    });
  if (!allowedRoots.some((root) => pathContains(root, resolvedCandidate))) {
    throw new Error("archived transcript is outside the configured Codex archive");
  }
  return resolvedCandidate;
}

function isInjectedUserText(value) {
  const text = String(value || "").trimStart();
  return (
    text === "<image>" ||
    text === "</image>" ||
    INJECTED_USER_PREFIXES.some((prefix) => text.startsWith(prefix))
  );
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function messageFromRecord(record) {
  if (record?.type !== "response_item" || record?.payload?.type !== "message") return null;
  const role = record.payload.role;
  if (role !== "user" && role !== "assistant") return null;

  const parts = [];
  for (const item of Array.isArray(record.payload.content) ? record.payload.content : []) {
    if (role === "user" && item?.type === "input_image") {
      parts.push("[Image attachment — not rendered in this read-only viewer]");
      continue;
    }
    const expectedType = role === "user" ? "input_text" : "output_text";
    if (item?.type !== expectedType) continue;
    if (role === "user" && isInjectedUserText(item.text)) continue;
    const text = cleanText(item.text);
    if (text) parts.push(text);
  }
  if (parts.length === 0) return null;
  return { role, text: parts.join("\n\n") };
}

function safeHeader(value, fallback = "—") {
  const text = cleanText(value).replace(/\s+/g, " ");
  return text || fallback;
}

function renderTranscript(chat, messages, { truncated = false } = {}) {
  const lines = [
    "CODEX PROJECT HISTORY — ARCHIVED CHAT",
    "",
    "Read-only snapshot. Opening this document did not restore or modify the chat.",
    "",
    `Title: ${safeHeader(chat.display_title, "Untitled chat")}`,
    `Project: ${safeHeader(chat.project_label)}`,
    `Branch: ${safeHeader(chat.git_branch)}`,
    `Working directory: ${safeHeader(chat.cwd)}`,
    `Chat ID: ${safeHeader(chat.id)}`,
    "",
    "=".repeat(78),
  ];

  if (messages.length === 0) {
    lines.push("", "No user or assistant text was found in this archived transcript.");
  }
  for (const message of messages) {
    lines.push("", message.role === "user" ? "USER" : "ASSISTANT", "-".repeat(78));
    lines.push(message.text);
  }
  if (truncated) {
    lines.push(
      "",
      "[Transcript truncated to keep the VS Code editor responsive. The archived source was not changed.]",
    );
  }
  return `${lines.join("\n")}\n`;
}

async function readArchivedTranscript({
  chat,
  sqliteHome,
  dataHome = codexDataHome(),
  maxCharacters = MAX_RENDERED_CHARACTERS,
}) {
  const filename = resolveArchivedTranscript(chat, { sqliteHome, dataHome });
  const input = fs.createReadStream(filename, { encoding: "utf8" });
  const reader = readline.createInterface({ input, crlfDelay: Infinity });
  const messages = [];
  let renderedCharacters = 0;
  let lineNumber = 0;
  let truncated = false;

  try {
    for await (const line of reader) {
      lineNumber += 1;
      if (!line.trim()) continue;
      let record;
      try {
        record = JSON.parse(line);
      } catch {
        throw new Error(`archived transcript contains invalid JSON on line ${lineNumber}`);
      }
      const message = messageFromRecord(record);
      if (!message) continue;
      if (renderedCharacters + message.text.length > maxCharacters) {
        const remaining = Math.max(0, maxCharacters - renderedCharacters);
        if (remaining > 0) messages.push({ ...message, text: message.text.slice(0, remaining) });
        truncated = true;
        break;
      }
      messages.push(message);
      renderedCharacters += message.text.length;
    }
  } finally {
    reader.close();
    input.destroy();
  }

  return renderTranscript(chat, messages, { truncated });
}

module.exports = {
  MAX_RENDERED_CHARACTERS,
  codexDataHome,
  isInjectedUserText,
  messageFromRecord,
  pathContains,
  readArchivedTranscript,
  renderTranscript,
  resolveArchivedTranscript,
};
