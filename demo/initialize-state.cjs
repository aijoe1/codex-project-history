#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const [codexBinary, codexHome, sqliteHome] = process.argv.slice(2);
if (!codexBinary || !codexHome || !sqliteHome) {
  console.error("usage: initialize-state.cjs <codex-binary> <codex-home> <sqlite-home>");
  process.exit(2);
}

fs.mkdirSync(codexHome, { recursive: true });
fs.mkdirSync(sqliteHome, { recursive: true });

const child = spawn(codexBinary, ["app-server"], {
  env: {
    ...process.env,
    CODEX_HOME: codexHome,
    CODEX_SQLITE_HOME: sqliteHome,
  },
  stdio: ["pipe", "pipe", "pipe"],
});

let initialized = false;
let responseError = "";
let stdoutBuffer = "";
let stderrBuffer = "";

const timer = setTimeout(() => {
  responseError = "official Codex app-server initialization timed out after 15 seconds";
  child.kill("SIGKILL");
}, 15_000);

child.on("error", (error) => {
  responseError = `could not start the official Codex app-server: ${error.message}`;
});

child.stdin.on("error", (error) => {
  if (!responseError) responseError = `could not write to the official Codex app-server: ${error.message}`;
});

child.stderr.on("data", (chunk) => {
  stderrBuffer = (stderrBuffer + chunk.toString()).slice(-16_384);
});

child.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk.toString();
  if (stdoutBuffer.length > 1_048_576) {
    responseError = "official Codex app-server returned more than 1 MiB before initialization";
    child.kill("SIGKILL");
    return;
  }

  let newline;
  while ((newline = stdoutBuffer.indexOf("\n")) >= 0) {
    const line = stdoutBuffer.slice(0, newline);
    stdoutBuffer = stdoutBuffer.slice(newline + 1);
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    if (message.id !== 1) continue;
    if (message.result) {
      initialized = true;
    } else {
      responseError = `official Codex app-server rejected initialization: ${JSON.stringify(message.error ?? message)}`;
    }
    child.stdin.end();
  }
});

child.on("close", (code, signal) => {
  clearTimeout(timer);
  if (!initialized || code !== 0) {
    const details = [
      responseError,
      code === null ? `app-server stopped with signal ${signal}` : `app-server exited with code ${code}`,
      stderrBuffer.trim(),
    ].filter(Boolean).join("\n");
    console.error(details || "official Codex app-server did not initialize");
    process.exitCode = 1;
    return;
  }

  const databases = fs.readdirSync(sqliteHome)
    .filter((name) => /^state_\d+\.sqlite$/.test(name))
    .sort((left, right) => {
      const leftVersion = Number(left.match(/\d+/)[0]);
      const rightVersion = Number(right.match(/\d+/)[0]);
      return rightVersion - leftVersion;
    });
  if (databases.length === 0) {
    console.error("official Codex initialized without creating a state_*.sqlite database");
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`${path.join(sqliteHome, databases[0])}\n`);
});

child.stdin.write(`${JSON.stringify({
  id: 1,
  method: "initialize",
  params: {
    clientInfo: {
      name: "codex-project-history-demo",
      version: "0.1.4",
    },
  },
})}\n`);
