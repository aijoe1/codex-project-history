#!/usr/bin/env node
"use strict";

const path = require("node:path");
const {
  codexSqliteHome,
  loadChats,
  organizeChats,
  workspaceProjectKeys,
} = require("../src/history");

const workspace = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const codexHome = codexSqliteHome();
const diagnostics = [];
const chats = loadChats({
  codexHome,
  maxChats: 300,
  onDiagnostic: (value) => diagnostics.push(value),
});
const groups = organizeChats(chats, [workspace], workspaceProjectKeys([workspace]));

process.stdout.write(
  `${JSON.stringify(
    {
      workspace,
      codexHome,
      diagnostics,
      chatCount: chats.length,
      groups: groups.map((group) => ({
        project: group.label,
        current: group.current,
        chatCount: group.chats.length,
        newest: group.chats[0]
          ? {
              id: group.chats[0].id,
              title: group.chats[0].display_title,
              cwd: group.chats[0].cwd,
              branch: group.chats[0].git_branch,
            }
          : null,
      })),
    },
    null,
    2,
  )}\n`,
);
