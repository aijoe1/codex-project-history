"use strict";

const vscode = require("vscode");
const {
  buildCodexThreadUri,
  codexSqliteHome,
  loadChats,
  organizeChats,
  shorten,
  workspaceProjectKeys,
} = require("./src/history");
const { codexDataHome, readArchivedTranscript } = require("./src/transcript");
const { bundledCodexPath, unarchiveChat } = require("./src/restore");

const OPENAI_EXTENSION_ID = "openai.chatgpt";
const OPENAI_EDITOR_ID = "chatgpt.conversationEditor";
const COMMAND_ID = "codexProjectHistory.open";
const ARCHIVED_COMMAND_ID = "codexProjectHistory.openArchived";
const RESTORE_COMMAND_ID = "codexProjectHistory.restoreArchived";
const ARCHIVE_DOCUMENT_SCHEME = "codex-project-history-archive";
const DIAGNOSTIC_CHANNEL = "Codex Project History";

let diagnosticOutput;
let archiveDocuments;

class ArchiveDocumentProvider {
  constructor() {
    this.documents = new Map();
    this.changed = new vscode.EventEmitter();
    this.onDidChange = this.changed.event;
  }

  store(chat, content) {
    const title = shorten(chat.display_title, 80)
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Archived Codex chat";
    const uri = vscode.Uri.from({
      scheme: ARCHIVE_DOCUMENT_SCHEME,
      path: `/archives/${chat.id}/${title}.txt`,
    });
    this.documents.set(uri.toString(), content);
    this.changed.fire(uri);
    return uri;
  }

  provideTextDocumentContent(uri) {
    return this.documents.get(uri.toString()) || "Archived transcript is no longer available.";
  }

  dispose() {
    this.documents.clear();
    this.changed.dispose();
  }
}

function logDiagnostic(message) {
  diagnosticOutput?.appendLine(`[${new Date().toISOString()}] ${message}`);
}

function workspaceRoots() {
  return (vscode.workspace.workspaceFolders || []).map((folder) => folder.uri.fsPath);
}

function relativeAge(unixSeconds, now = Date.now()) {
  const elapsedSeconds = Math.max(0, Math.floor(now / 1000) - Number(unixSeconds || 0));
  if (elapsedSeconds < 60) return "now";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h`;
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)}d`;
  return new Date(Number(unixSeconds) * 1000).toLocaleDateString();
}

function quickPickItems(groups, { archived = false } = {}) {
  const items = [];
  for (const group of groups) {
    items.push({
      label: group.current ? `${group.label} — current workspace` : group.label,
      kind: vscode.QuickPickItemKind.Separator,
    });
    for (const chat of group.chats) {
      const branch = chat.git_branch ? `$(git-branch) ${chat.git_branch}` : "no branch";
      items.push({
        label: `${archived ? "$(archive)" : "$(comment-discussion)"} [${group.label}] ${shorten(chat.display_title, 62)}`,
        description: `${branch} · ${relativeAge(chat.last_used_at)}`,
        detail: chat.cwd,
        chat: { ...chat, project_label: group.label },
      });
    }
  }
  return items;
}

async function openCodexChat(chat) {
  const resource = vscode.Uri.parse(buildCodexThreadUri(chat.id));
  await vscode.commands.executeCommand("vscode.openWith", resource, OPENAI_EDITOR_ID, {
    preview: false,
  });
}

async function restoreArchivedChat(chat, openai) {
  const confirmation = await vscode.window.showWarningMessage(
    `Restore “${shorten(chat.display_title, 80)}” to active Codex chats?`,
    {
      modal: true,
      detail: "This changes the chat's archive state. It will remain active until you archive it again.",
    },
    "Restore and open",
  );
  if (confirmation !== "Restore and open") return;

  try {
    const binary = bundledCodexPath(openai?.extensionPath) || "codex";
    await unarchiveChat(chat.id, { binary });
    await openCodexChat(chat);
  } catch (error) {
    logDiagnostic(`Restore failed for ${chat.id}: ${error.message}`);
    const action = await vscode.window.showErrorMessage(
      `Could not restore archived chat: ${error.message}`,
      "Show diagnostics",
    );
    if (action === "Show diagnostics") diagnosticOutput?.show(true);
  }
}

async function openArchivedChat(chat, sqliteHome, openai) {
  let content;
  try {
    content = await readArchivedTranscript({
      chat,
      sqliteHome,
      dataHome: codexDataHome(),
    });
  } catch (error) {
    logDiagnostic(`Archived transcript read failed for ${chat.id}: ${error.message}`);
    const action = await vscode.window.showErrorMessage(
      `Could not open archived transcript: ${error.message}`,
      "Show diagnostics",
    );
    if (action === "Show diagnostics") diagnosticOutput?.show(true);
    return;
  }

  const uri = archiveDocuments.store(chat, content);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document, { preview: false });
  const action = await vscode.window.showInformationMessage(
    "Opened archived chat read-only. Its archive state was not changed.",
    "Restore to Codex",
  );
  if (action === "Restore to Codex") await restoreArchivedChat(chat, openai);
}

async function pickHistory({ archived = false, restore = false } = {}) {
  const openai = vscode.extensions.getExtension(OPENAI_EXTENSION_ID);
  if (!openai) {
    void vscode.window.showErrorMessage("Install or enable the OpenAI Codex extension first.");
    return;
  }

  const config = vscode.workspace.getConfiguration("codexProjectHistory");
  const maxChats = config.get("maxChats", 300);
  const sqliteHome = codexSqliteHome();
  let chats;
  try {
    chats = loadChats({
      codexHome: sqliteHome,
      maxChats,
      archived,
      onDiagnostic: logDiagnostic,
    });
  } catch (error) {
    logDiagnostic(`History read failed: ${error.message}`);
    const action = await vscode.window.showErrorMessage(
      `Could not read Codex chat history: ${error.message}`,
      "Show diagnostics",
    );
    if (action === "Show diagnostics") diagnosticOutput?.show(true);
    return;
  }

  if (chats.length === 0) {
    const state = archived ? "archived" : "active";
    void vscode.window.showInformationMessage(`No ${state} VS Code Codex chats were found.`);
    return;
  }

  const roots = workspaceRoots();
  const picked = await vscode.window.showQuickPick(
    quickPickItems(organizeChats(chats, roots, workspaceProjectKeys(roots)), { archived }),
    {
      title: archived ? "Archived Codex chats by project" : "Active Codex chats by project",
      placeHolder: "Search title, repository, branch, or working directory",
      matchOnDescription: true,
      matchOnDetail: true,
      ignoreFocusOut: true,
    },
  );
  if (!picked || !picked.chat) return;

  if (restore) {
    await restoreArchivedChat(picked.chat, openai);
    return;
  }
  if (archived) {
    await openArchivedChat(picked.chat, sqliteHome, openai);
    return;
  }

  try {
    await openCodexChat(picked.chat);
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Codex could not open chat ${picked.chat.id}: ${error.message}`,
    );
  }
}

function activate(context) {
  diagnosticOutput = vscode.window.createOutputChannel(DIAGNOSTIC_CHANNEL);
  archiveDocuments = new ArchiveDocumentProvider();
  context.subscriptions.push(diagnosticOutput);
  context.subscriptions.push(archiveDocuments);
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(ARCHIVE_DOCUMENT_SCHEME, archiveDocuments),
  );
  context.subscriptions.push(vscode.commands.registerCommand(COMMAND_ID, () => pickHistory()));
  context.subscriptions.push(
    vscode.commands.registerCommand(ARCHIVED_COMMAND_ID, () => pickHistory({ archived: true })),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(RESTORE_COMMAND_ID, () =>
      pickHistory({ archived: true, restore: true }),
    ),
  );

  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 15);
  item.command = COMMAND_ID;
  item.text = "$(repo) Project Chats";
  item.tooltip = "Search active Codex chats; archived chats are available from the Command Palette";
  context.subscriptions.push(item);

  const syncStatusBar = () => {
    const config = vscode.workspace.getConfiguration("codexProjectHistory");
    if (config.get("showStatusBar", true)) item.show();
    else item.hide();
  };
  syncStatusBar();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("codexProjectHistory.showStatusBar")) syncStatusBar();
    }),
  );
}

function deactivate() {
  diagnosticOutput = undefined;
  archiveDocuments = undefined;
}

module.exports = { activate, deactivate };
