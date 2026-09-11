"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Module = require("node:module");
const { execFileSync } = require("node:child_process");
const manifest = require("../package.json");
const {
  buildCodexThreadUri,
  candidateStateDatabases,
  chatQuery,
  clampLimit,
  codexSqliteHome,
  loadChats,
  organizeChats,
  repositoryKey,
  repositoryLabel,
  repositorySlug,
  shorten,
  sqliteErrorMessage,
  workspaceProjectKeys,
} = require("../src/history");
const {
  isInjectedUserText,
  messageFromRecord,
  readArchivedTranscript,
  renderTranscript,
  resolveArchivedTranscript,
} = require("../src/transcript");
const {
  RESTORE_TIMEOUT_MS,
  bundledCodexPath,
  restoreErrorMessage,
  unarchiveChat,
} = require("../src/restore");

test("release manifest disables npm publication", () => {
  assert.equal(manifest.private, true);
});

test("state databases are selected newest-schema-first", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-history-test-"));
  try {
    fs.writeFileSync(path.join(root, "state_2.sqlite"), "");
    fs.writeFileSync(path.join(root, "state_12.sqlite"), "");
    fs.writeFileSync(path.join(root, "logs_99.sqlite"), "");
    assert.deepEqual(candidateStateDatabases(root).map((value) => path.basename(value)), [
      "state_12.sqlite",
      "state_2.sqlite",
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("history query is bounded and includes only user VS Code chats", () => {
  assert.equal(clampLimit(-1), 25);
  assert.equal(clampLimit(50000), 1000);
  const query = chatQuery(80);
  assert.match(query, /source = 'vscode'/);
  assert.match(query, /thread_source.*'user'/s);
  assert.match(query, /archived = 0/);
  assert.match(query, /rollout_path/);
  assert.match(query, /LIMIT 80/);

  const archivedQuery = chatQuery(80, { archived: true });
  assert.match(archivedQuery, /archived = 1/);
  assert.doesNotMatch(archivedQuery, /archived = 0/);
});

test("loader sends the archived selector to SQLite without changing the database", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-history-test-"));
  try {
    fs.writeFileSync(path.join(root, "state_5.sqlite"), "");
    let query;
    loadChats({
      codexHome: root,
      archived: true,
      run(_binary, args) {
        query = args[3];
        return "[]";
      },
    });
    assert.match(query, /archived = 1/);
    assert.doesNotMatch(query, /\b(?:UPDATE|INSERT|DELETE|REPLACE|ALTER|DROP)\b/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("loader falls back when the newest state database is incompatible", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-history-test-"));
  try {
    fs.writeFileSync(path.join(root, "state_9.sqlite"), "");
    fs.writeFileSync(path.join(root, "state_8.sqlite"), "");
    const calls = [];
    const chats = loadChats({
      codexHome: root,
      run(_binary, args) {
        calls.push(path.basename(args[2]));
        if (args[2].endsWith("state_9.sqlite")) throw new Error("no such table: threads");
        return JSON.stringify([{ id: "abc", cwd: "/work/repo" }]);
      },
    });
    assert.deepEqual(calls, ["state_9.sqlite", "state_8.sqlite"]);
    assert.equal(chats.length, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("loader reports a newest-database timeout instead of returning stale history", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-history-test-"));
  try {
    fs.writeFileSync(path.join(root, "state_9.sqlite"), "");
    fs.writeFileSync(path.join(root, "state_8.sqlite"), "");
    const calls = [];
    assert.throws(
      () =>
        loadChats({
          codexHome: root,
          run(_binary, args) {
            calls.push(path.basename(args[2]));
            if (args[2].endsWith("state_9.sqlite")) {
              const error = new Error("command timed out");
              error.code = "ETIMEDOUT";
              throw error;
            }
            return JSON.stringify([{ id: "stale", cwd: "/work/old-repo" }]);
          },
        }),
      /state_9\.sqlite: SQLite read timed out after 2000 ms/,
    );
    assert.deepEqual(calls, ["state_9.sqlite"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("SQLite state location prefers CODEX_SQLITE_HOME over CODEX_HOME", () => {
  assert.equal(
    codexSqliteHome(
      { CODEX_SQLITE_HOME: "/custom/sqlite", CODEX_HOME: "/custom/codex" },
      "/Users/demo",
    ),
    "/custom/sqlite",
  );
  assert.equal(codexSqliteHome({ CODEX_HOME: "/custom/codex" }, "/Users/demo"), "/custom/codex");
  assert.equal(codexSqliteHome({}, "/Users/demo"), "/Users/demo/.codex");
});

test("loader retries CANTOPEN with an immutable URI when WAL sidecars are absent", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-history-test-"));
  try {
    const database = path.join(root, "state_5.sqlite");
    fs.writeFileSync(database, "");
    const calls = [];
    const diagnostics = [];
    const chats = loadChats({
      codexHome: root,
      onDiagnostic: (message) => diagnostics.push(message),
      run(_binary, args) {
        calls.push(args[2]);
        if (!args[2].startsWith("file:")) {
          const error = new Error(`Command failed: /usr/bin/sqlite3 ${chatQuery(300)}`);
          error.stderr = Buffer.from("Error: in prepare, unable to open database file (14)\n");
          throw error;
        }
        return JSON.stringify([{ id: "abc", cwd: "/work/repo" }]);
      },
    });

    const retryUri = new URL(calls[1]);
    assert.equal(calls[0], database);
    assert.equal(retryUri.pathname, database);
    assert.equal(retryUri.searchParams.get("mode"), "ro");
    assert.equal(retryUri.searchParams.get("immutable"), "1");
    assert.equal(chats.length, 1);
    assert.match(diagnostics[0], /immutable retry/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("loader does not ignore an existing WAL sidecar and keeps errors concise", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-history-test-"));
  try {
    fs.writeFileSync(path.join(root, "state_5.sqlite"), "");
    fs.writeFileSync(path.join(root, "state_5.sqlite-wal"), "");
    let calls = 0;
    assert.throws(
      () =>
        loadChats({
          codexHome: root,
          run() {
            calls += 1;
            const error = new Error(`Command failed: /usr/bin/sqlite3 ${chatQuery(300)}`);
            error.stderr = "Error: in prepare, unable to open database file (14)\n";
            throw error;
          },
        }),
      (error) => {
        assert.match(error.message, /unable to open database file \(14\)/);
        assert.doesNotMatch(error.message, /SELECT|Command failed/);
        return true;
      },
    );
    assert.equal(calls, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test(
  "real WAL database remains readable after a clean close removes its sidecars",
  { skip: !fs.existsSync("/usr/bin/sqlite3") || process.getuid?.() === 0 },
  () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex history test-"));
    const database = path.join(root, "state_5.sqlite");
    try {
      execFileSync(
        "/usr/bin/sqlite3",
        [
          database,
          `
PRAGMA journal_mode=WAL;
CREATE TABLE threads (
  id TEXT, name TEXT, preview TEXT, title TEXT, cwd TEXT,
  git_branch TEXT, git_origin_url TEXT, recency_at INTEGER,
  updated_at INTEGER, archived INTEGER, source TEXT, thread_source TEXT
);
INSERT INTO threads VALUES (
  '00000000-0000-4000-8000-000000000001', 'WAL recovery', '', '', '/work/repo',
  'main', 'https://github.com/example/repo.git', 10, 10, 0, 'vscode', 'user'
);
PRAGMA wal_checkpoint(TRUNCATE);
`.trim(),
        ],
        { encoding: "utf8" },
      );
      for (const suffix of ["-wal", "-shm"]) {
        const sidecar = `${database}${suffix}`;
        if (fs.existsSync(sidecar)) fs.unlinkSync(sidecar);
      }

      let directError;
      let directRows;
      try {
        const output = execFileSync(
          "/usr/bin/sqlite3",
          ["-readonly", "-json", database, chatQuery(300)],
          {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
        directRows = JSON.parse(output);
      } catch (error) {
        directError = error;
      }

      // macOS's system SQLite returns CANTOPEN here, while Linux can reopen
      // the clean main database directly. Both are valid SQLite behaviors.
      if (directError) {
        assert.match(sqliteErrorMessage(directError), /unable to open database file \(14\)/);
      } else {
        assert.equal(directRows.length, 1);
        assert.equal(directRows[0].display_title, "WAL recovery");
      }

      const diagnostics = [];
      const chats = loadChats({
        codexHome: root,
        onDiagnostic: (message) => diagnostics.push(message),
      });
      assert.equal(chats.length, 1);
      assert.equal(chats[0].display_title, "WAL recovery");
      if (directError) {
        assert.match(diagnostics[0], /immutable retry/);
      } else {
        assert.deepEqual(diagnostics, []);
      }
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  },
);

test("current workspace group is first and worktrees share their Git project", () => {
  const chats = [
    {
      id: "1",
      cwd: "/Users/demo/toolkit-worktrees/review",
      git_origin_url: "git@github.com:example/toolkit.git",
      last_used_at: 30,
    },
    {
      id: "2",
      cwd: "/Users/demo/acme-dashboard",
      git_origin_url: "https://github.com/example/acme-dashboard.git",
      last_used_at: 20,
    },
    {
      id: "3",
      cwd: "/private/tmp/acme-dashboard-review",
      git_origin_url: "https://github.com/example/acme-dashboard.git",
      last_used_at: 10,
    },
  ];
  const groups = organizeChats(
    chats,
    ["/Users/demo/acme-dashboard"],
    ["git:github.com/example/acme-dashboard"],
  );
  assert.equal(groups[0].label, "example/acme-dashboard");
  assert.equal(groups[0].current, true);
  assert.deepEqual(groups[0].chats.map((chat) => chat.id), ["2", "3"]);
  assert.equal(groups[1].label, "example/toolkit");
});

test("a relocated worktree is current through repository identity", () => {
  const chats = [
    {
      id: "other",
      cwd: "/Users/demo/recent-project",
      git_origin_url: "https://github.com/example/recent-project.git",
      last_used_at: 100,
    },
    {
      id: "config-repo",
      cwd: "/Users/demo/config-repo",
      git_origin_url: "https://github.com/example/config-repo.git",
      last_used_at: 10,
    },
  ];
  const groups = organizeChats(
    chats,
    ["/private/tmp/new-config-worktree"],
    ["git:github.com/example/config-repo"],
  );
  assert.equal(groups[0].label, "example/config-repo");
  assert.equal(groups[0].current, true);
});

test("a cwd-only ancestor chat is not mistaken for the current workspace", () => {
  const groups = organizeChats(
    [
      { id: "home", cwd: "/Users/demo", last_used_at: 100 },
      { id: "project", cwd: "/Users/demo/project", last_used_at: 10 },
    ],
    ["/Users/demo/project"],
  );
  assert.equal(groups[0].key, "cwd:/Users/demo/project");
  assert.equal(groups[0].current, true);
  assert.equal(groups[1].key, "cwd:/Users/demo");
  assert.equal(groups[1].current, false);
});

test("a nested chat from a different Git repository is not current by cwd alone", () => {
  const groups = organizeChats(
    [
      {
        id: "nested-repository",
        cwd: "/Users/demo/project/vendor/other",
        git_origin_url: "https://git.example/other/repository.git",
        last_used_at: 100,
      },
      { id: "workspace", cwd: "/Users/demo/project", last_used_at: 10 },
    ],
    ["/Users/demo/project"],
  );
  assert.equal(groups[0].key, "cwd:/Users/demo/project");
  assert.equal(groups[0].current, true);
  assert.equal(groups[1].key, "git:git.example/other/repository");
  assert.equal(groups[1].current, false);
});

test("an exact cwd remains current when its stored Git identity no longer matches", () => {
  const groups = organizeChats(
    [
      {
        id: "workspace-old-origin",
        cwd: "/Users/demo/project",
        git_origin_url: "https://git.example/old/repository.git",
        last_used_at: 10,
      },
      {
        id: "newer-other",
        cwd: "/Users/demo/other",
        git_origin_url: "https://git.example/other/repository.git",
        last_used_at: 100,
      },
    ],
    ["/Users/demo/project"],
    ["git:git.example/new/repository"],
  );
  assert.equal(groups[0].key, "git:git.example/old/repository");
  assert.equal(groups[0].current, true);
  assert.equal(groups[1].current, false);
});

test("workspace repository keys normalize Git remote formats", () => {
  const calls = [];
  const keys = workspaceProjectKeys(["/one", "/two", "/not-git"], (_binary, args) => {
    calls.push(args[1]);
    if (args[1] === "/one") return "https://github.com/example/config-repo.git\n";
    if (args[1] === "/two") return "git@github.com:example/toolkit.git\n";
    throw new Error("not a repository");
  });
  assert.deepEqual(calls, ["/one", "/two", "/not-git"]);
  assert.deepEqual(Array.from(keys).sort(), [
    "git:github.com/example/config-repo",
    "git:github.com/example/toolkit",
  ]);
});

test("repository labels support HTTPS and SSH origins", () => {
  assert.equal(repositorySlug("https://github.com/example/config-repo.git"), "config-repo");
  assert.equal(repositorySlug("git@github.com:example/toolkit.git"), "toolkit");
  assert.equal(repositoryLabel("git@github.com:example/toolkit.git"), "example/toolkit");
  assert.equal(
    repositoryKey("https://github.com/example/toolkit.git"),
    repositoryKey("git@github.com:example/toolkit.git"),
  );
  assert.notEqual(
    repositoryKey("https://git.example.test:8443/acme/repo.git"),
    repositoryKey("https://git.example.test:9443/acme/repo.git"),
  );
  assert.notEqual(
    repositoryKey("https://git.example.test/acme/App.git"),
    repositoryKey("https://git.example.test/acme/app.git"),
  );
  assert.equal(
    repositoryKey("https://git.example.test/acme/repo.git?token=x#readme"),
    repositoryKey("https://git.example.test/acme/repo"),
  );
});

test("same-named repositories on different hosts get distinct labels", () => {
  const groups = organizeChats([
    {
      id: "one",
      cwd: "/work/one",
      git_origin_url: "https://git-one.example/acme/app.git",
      last_used_at: 20,
    },
    {
      id: "two",
      cwd: "/work/two",
      git_origin_url: "https://git-two.example/acme/app.git",
      last_used_at: 10,
    },
  ]);
  assert.deepEqual(groups.map((group) => group.label), [
    "git-one.example/acme/app",
    "git-two.example/acme/app",
  ]);
});

test("archived transcript paths stay inside the configured Codex archive", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-archive-test-"));
  const archive = path.join(root, "archived_sessions");
  const id = "00000000-0000-4000-8000-000000000001";
  const transcript = path.join(archive, `rollout-${id}.jsonl`);
  try {
    fs.mkdirSync(archive);
    fs.writeFileSync(transcript, "");
    assert.equal(
      resolveArchivedTranscript(
        { id, archived: 1, rollout_path: transcript },
        { sqliteHome: root, dataHome: root },
      ),
      fs.realpathSync(transcript),
    );

    const outside = path.join(root, `outside-${id}.jsonl`);
    fs.writeFileSync(outside, "");
    assert.throws(
      () =>
        resolveArchivedTranscript(
          { id, archived: 1, rollout_path: outside },
          { sqliteHome: root, dataHome: root },
        ),
      /outside the configured Codex archive/,
    );
    assert.throws(
      () =>
        resolveArchivedTranscript(
          { id, archived: 0, rollout_path: transcript },
          { sqliteHome: root, dataHome: root },
        ),
      /not archived/,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("transcript parser keeps conversation text and removes injected session context", () => {
  assert.equal(isInjectedUserText("<environment_context>private runtime</environment_context>"), true);
  assert.equal(isInjectedUserText("ordinary user text"), false);

  const user = messageFromRecord({
    type: "response_item",
    payload: {
      type: "message",
      role: "user",
      content: [
        { type: "input_text", text: "<recommended_plugins>internal</recommended_plugins>" },
        { type: "input_text", text: "Show me the archived chat." },
        { type: "input_text", text: "<image>" },
        { type: "input_image", image_url: "data:image/png;base64,not-rendered" },
        { type: "input_text", text: "</image>" },
      ],
    },
  });
  assert.deepEqual(user, {
    role: "user",
    text: "Show me the archived chat.\n\n[Image attachment — not rendered in this read-only viewer]",
  });
  assert.deepEqual(
    messageFromRecord({
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: "Here it is." }],
      },
    }),
    { role: "assistant", text: "Here it is." },
  );
  assert.equal(
    messageFromRecord({
      type: "response_item",
      payload: {
        type: "message",
        role: "developer",
        content: [{ type: "input_text", text: "Never render this." }],
      },
    }),
    null,
  );
});

test("archived JSONL renders as a bounded read-only transcript", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-archive-test-"));
  const archive = path.join(root, "archived_sessions");
  const id = "00000000-0000-4000-8000-000000000001";
  const transcript = path.join(archive, `rollout-${id}.jsonl`);
  const records = [
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "First message" }],
      },
    },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: "A much longer assistant response" }],
      },
    },
  ];
  try {
    fs.mkdirSync(archive);
    fs.writeFileSync(transcript, `${records.map(JSON.stringify).join("\n")}\n`);
    const output = await readArchivedTranscript({
      chat: {
        id,
        archived: 1,
        rollout_path: transcript,
        display_title: "Archive test",
        project_label: "example/project",
        git_branch: "main",
        cwd: "/work/project",
      },
      sqliteHome: root,
      dataHome: root,
      maxCharacters: 20,
    });
    assert.match(output, /Read-only snapshot/);
    assert.match(output, /USER\n-+\nFirst message/);
    assert.match(output, /ASSISTANT\n-+\nA much/);
    assert.match(output, /Transcript truncated/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("transcript renderer contains no restore command or file mutation instruction", () => {
  const output = renderTranscript(
    {
      id: "00000000-0000-4000-8000-000000000001",
      display_title: "Read only",
      project_label: "example/project",
      cwd: "/work/project",
    },
    [{ role: "user", text: "Hello" }],
  );
  assert.match(output, /did not restore or modify/);
  assert.doesNotMatch(output, /codex unarchive|UPDATE threads/i);
});

test("restore uses an exact argv call only after UUID validation", async () => {
  const id = "00000000-0000-4000-8000-000000000001";
  let invocation;
  await unarchiveChat(id, {
    binary: "/official-extension/bin/macos-aarch64/codex",
    run: async (...args) => {
      invocation = args;
      return { stdout: "Unarchived session", stderr: "" };
    },
  });
  assert.equal(invocation[0], "/official-extension/bin/macos-aarch64/codex");
  assert.deepEqual(invocation[1], ["unarchive", id]);
  assert.equal(invocation[2].timeout, RESTORE_TIMEOUT_MS);
  assert.equal(invocation[2].killSignal, "SIGKILL");
  await assert.rejects(() => unarchiveChat("bad; touch /tmp/nope"), /invalid Codex chat ID/);
  await assert.rejects(() => unarchiveChat("------------------------------------"), /invalid Codex chat ID/);
  assert.match(
    restoreErrorMessage({ code: "ETIMEDOUT" }),
    new RegExp(`${RESTORE_TIMEOUT_MS / 1000} seconds`),
  );
});

test("restore prefers the official extension's bundled macOS Codex binary", () => {
  assert.equal(
    bundledCodexPath("/official-extension", {
      platform: "darwin",
      architecture: "arm64",
      exists: (candidate) => candidate.endsWith("/bin/macos-aarch64/codex"),
    }),
    "/official-extension/bin/macos-aarch64/codex",
  );
  assert.equal(
    bundledCodexPath("/official-extension", {
      platform: "linux",
      architecture: "x64",
      exists: () => true,
    }),
    null,
  );
});

test("status bar follows configuration changes without a reload", () => {
  let enabled = true;
  let listener;
  const registeredCommands = [];
  let registeredProviderScheme;
  const status = { showCount: 0, hideCount: 0 };
  const outputChannel = { appendLine() {}, dispose() {}, show() {} };
  const item = {
    show() {
      status.showCount += 1;
    },
    hide() {
      status.hideCount += 1;
    },
  };
  const vscode = {
    commands: {
      registerCommand(command) {
        registeredCommands.push(command);
        return { dispose() {} };
      },
    },
    EventEmitter: class EventEmitter {
      constructor() {
        this.event = () => ({ dispose() {} });
      }
      fire() {}
      dispose() {}
    },
    extensions: { getExtension: () => ({}) },
    window: {
      createOutputChannel: () => outputChannel,
      createStatusBarItem: () => item,
    },
    workspace: {
      getConfiguration: () => ({ get: () => enabled }),
      registerTextDocumentContentProvider(scheme) {
        registeredProviderScheme = scheme;
        return { dispose() {} };
      },
      onDidChangeConfiguration(callback) {
        listener = callback;
        return { dispose() {} };
      },
    },
    StatusBarAlignment: { Left: 1 },
    QuickPickItemKind: { Separator: -1 },
    Uri: { from: () => ({ toString: () => "archive:test" }) },
  };
  const originalLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === "vscode") return vscode;
    return originalLoad.call(this, request, parent, isMain);
  };
  const extensionPath = require.resolve("../extension");
  delete require.cache[extensionPath];
  try {
    const extension = require(extensionPath);
    const context = { subscriptions: [] };
    extension.activate(context);
    assert.deepEqual(registeredCommands, [
      "codexProjectHistory.open",
      "codexProjectHistory.openArchived",
      "codexProjectHistory.restoreArchived",
    ]);
    assert.equal(registeredProviderScheme, "codex-project-history-archive");
    assert.equal(status.showCount, 1);
    assert.equal(status.hideCount, 0);

    enabled = false;
    listener({ affectsConfiguration: (name) => name === "codexProjectHistory.showStatusBar" });
    assert.equal(status.hideCount, 1);

    enabled = true;
    listener({ affectsConfiguration: () => true });
    assert.equal(status.showCount, 2);
  } finally {
    Module._load = originalLoad;
    delete require.cache[extensionPath];
  }
});

test("Codex route validation rejects malformed chat IDs", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  assert.equal(buildCodexThreadUri(id), `openai-codex://route/local/${id}`);
  assert.throws(() => buildCodexThreadUri("not-a-thread"), /invalid Codex chat ID/);
  assert.throws(() => buildCodexThreadUri("------------------------------------"), /invalid Codex chat ID/);
});

test("long and multiline titles become compact picker labels", () => {
  assert.equal(shorten("one\n two", 20), "one two");
  assert.equal(shorten("abcdefghijklmnopqrstuvwxyz", 10), "abcdefghi…");
});

// Use a real child that ignores SIGTERM to verify production timeout options.
function runStalledChild(options) {
  assert.ok(options.timeout > 0 && options.timeout <= 2500);
  assert.equal(options.killSignal, "SIGKILL");
  return execFileSync(process.execPath,
    ["-e", 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1000)'], options);
}

for (const immutable of [false, true]) {
  test(`stalled SQLite ${immutable ? "immutable retry" : "normal read"} is terminated`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-timeout-test-"));
    try {
      fs.writeFileSync(path.join(root, "state_5.sqlite"), "");
      fs.writeFileSync(path.join(root, "state_4.sqlite"), "");
      let calls = 0;
      let timedOut;
      assert.throws(() => loadChats({
        codexHome: root,
        run(binary, args, options) {
          calls += 1;
          assert.equal(binary, "/usr/bin/sqlite3");
          if (immutable && calls === 1) throw new Error("unable to open database file (14)");
          assert.equal(args[2].startsWith("file:"), immutable);
          try { return runStalledChild(options); }
          catch (error) { timedOut = error; throw error; }
        },
      }), /SQLite read timed out after 2000 ms/);
      assert.equal(calls, immutable ? 2 : 1);
      assert.equal(timedOut.code, "ETIMEDOUT");
      assert.equal(timedOut.signal, "SIGKILL");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

test("stalled Git lookup is terminated and directory grouping still works", () => {
  let timedOut;
  const keys = workspaceProjectKeys(["/work/demo"], (_binary, _args, options) => {
    try { return runStalledChild(options); }
    catch (error) { timedOut = error; throw error; }
  });
  assert.equal(timedOut.code, "ETIMEDOUT");
  assert.equal(timedOut.signal, "SIGKILL");
  assert.equal(keys.size, 0);
  const groups = organizeChats([{ id: "demo", cwd: "/work/demo" }], ["/work/demo"], keys);
  assert.equal(groups[0].current, true);
});

test(
  "demo setup initializes isolated state before inserting synthetic chats",
  { skip: process.platform !== "darwin" || !fs.existsSync("/usr/bin/sqlite3") },
  () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-demo-setup-test-"));
    const fixtureRoot = path.join(root, "fixture");
    const vscodeUserData = path.join(root, "vscode-user-data");
    const fakeCodex = path.join(root, "codex");
    try {
      fs.writeFileSync(fakeCodex, `#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
  const newline = input.indexOf("\\n");
  if (newline < 0) return;
  const request = JSON.parse(input.slice(0, newline));
  const stateRoot = process.env.CODEX_SQLITE_HOME;
  fs.mkdirSync(stateRoot, { recursive: true });
  execFileSync("/usr/bin/sqlite3", [path.join(stateRoot, "state_5.sqlite"), \`
    CREATE TABLE threads (
      id TEXT PRIMARY KEY, rollout_path TEXT NOT NULL, created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL, source TEXT NOT NULL, model_provider TEXT NOT NULL,
      cwd TEXT NOT NULL, title TEXT NOT NULL, name TEXT, preview TEXT NOT NULL DEFAULT '',
      sandbox_policy TEXT NOT NULL, approval_mode TEXT NOT NULL,
      has_user_event INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0,
      git_branch TEXT, git_origin_url TEXT, recency_at INTEGER NOT NULL DEFAULT 0,
      thread_source TEXT
    );
  \`]);
  process.stdout.write(JSON.stringify({ id: request.id, result: { userAgent: "fixture-test" } }) + "\\n");
});
`);
      fs.chmodSync(fakeCodex, 0o755);

      const output = execFileSync("/bin/bash", [path.join(__dirname, "..", "demo/setup-fixture.sh")], {
        cwd: path.join(__dirname, ".."),
        env: {
          ...process.env,
          CODEX_PROJECT_HISTORY_CODEX_BIN: fakeCodex,
          CODEX_PROJECT_HISTORY_DEMO_ROOT: fixtureRoot,
          CODEX_PROJECT_HISTORY_VSCODE_USER_DATA: vscodeUserData,
        },
        encoding: "utf8",
      });

      const stateRoot = path.join(fixtureRoot, "codex-state");
      const database = path.join(stateRoot, "state_5.sqlite");
      const schemaColumns = execFileSync(
        "/usr/bin/sqlite3",
        [database, "SELECT name FROM pragma_table_info('threads') ORDER BY cid;"],
        { encoding: "utf8" },
      ).trim().split("\n");
      assert.ok(schemaColumns.includes("rollout_path"));
      assert.ok(schemaColumns.includes("model_provider"));

      const chats = loadChats({ codexHome: stateRoot });
      assert.equal(chats.length, 3);
      const archivedChats = loadChats({ codexHome: stateRoot, archived: true });
      assert.equal(archivedChats.length, 1);
      assert.equal(archivedChats[0].id, "00000000-0000-4000-8000-000000000004");
      assert.equal(fs.existsSync(archivedChats[0].rollout_path), true);
      const workspace = path.join(fixtureRoot, "projects/acme-dashboard");
      const groups = organizeChats(chats, [workspace], workspaceProjectKeys([workspace]));
      assert.equal(groups.length, 2);
      assert.equal(groups[0].label, "example/acme-dashboard");
      assert.equal(groups[0].current, true);
      assert.deepEqual(groups[0].chats.map((chat) => chat.id), [
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000002",
      ]);
      assert.match(output, /official Codex runtime initialized the disposable state database/i);
      assert.match(output, /CODEX_HOME=.*CODEX_SQLITE_HOME=/);
      assert.match(output, /--new-window --user-data-dir=/);
      assert.match(output, new RegExp(vscodeUserData.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(output, /macOS IPC socket-length limit/);
      assert.match(output, /open the synthetic archived chat/);
      assert.match(output, /Do not try\s+to restore it/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  },
);

test("demo and test UUIDs use only the synthetic fixture namespace", () => {
  for (const filename of ["demo/setup-fixture.sh", "test/history.test.js"]) {
    const source = fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
    const ids = source.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
    assert.ok(ids?.length > 0);
    for (const id of ids) assert.match(id, /^00000000-0000-4000-8000-00000000000[1234]$/);
  }
});
