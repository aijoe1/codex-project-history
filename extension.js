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

const OPENAI_EXTENSION_ID = "openai.chatgpt";
const OPENAI_EDITOR_ID = "chatgpt.conversationEditor";
const COMMAND_ID = "codexProjectHistory.open";
const DIAGNOSTIC_CHANNEL = "Codex Project History";

let diagnosticOutput;

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

function quickPickItems(groups) {
  const items = [];
  for (const group of groups) {
    items.push({
      label: group.current ? `${group.label} — current workspace` : group.label,
      kind: vscode.QuickPickItemKind.Separator,
    });
    for (const chat of group.chats) {
      const branch = chat.git_branch ? `$(git-branch) ${chat.git_branch}` : "no branch";
      items.push({
        label: `$(comment-discussion) [${group.label}] ${shorten(chat.display_title, 62)}`,
        description: `${branch} · ${relativeAge(chat.last_used_at)}`,
        detail: chat.cwd,
        chat,
      });
    }
  }
  return items;
}

async function openHistory() {
  const openai = vscode.extensions.getExtension(OPENAI_EXTENSION_ID);
  if (!openai) {
    void vscode.window.showErrorMessage("Install or enable the OpenAI Codex extension first.");
    return;
  }

  const config = vscode.workspace.getConfiguration("codexProjectHistory");
  const maxChats = config.get("maxChats", 300);
  let chats;
  try {
    chats = loadChats({
      codexHome: codexSqliteHome(),
      maxChats,
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
    void vscode.window.showInformationMessage("No unarchived VS Code Codex chats were found.");
    return;
  }

  const roots = workspaceRoots();
  const picked = await vscode.window.showQuickPick(
    quickPickItems(organizeChats(chats, roots, workspaceProjectKeys(roots))),
    {
      title: "Codex chats by project",
      placeHolder: "Search title, repository, branch, or working directory",
      matchOnDescription: true,
      matchOnDetail: true,
      ignoreFocusOut: true,
    },
  );
  if (!picked || !picked.chat) return;

  const resource = vscode.Uri.parse(buildCodexThreadUri(picked.chat.id));
  try {
    await vscode.commands.executeCommand("vscode.openWith", resource, OPENAI_EDITOR_ID, {
      preview: false,
    });
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Codex could not open chat ${picked.chat.id}: ${error.message}`,
    );
  }
}

function activate(context) {
  diagnosticOutput = vscode.window.createOutputChannel(DIAGNOSTIC_CHANNEL);
  context.subscriptions.push(diagnosticOutput);
  context.subscriptions.push(vscode.commands.registerCommand(COMMAND_ID, openHistory));

  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 15);
  item.command = COMMAND_ID;
  item.text = "$(repo) Project Chats";
  item.tooltip = "Search Codex chats with project and branch context";
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
}

module.exports = { activate, deactivate };
