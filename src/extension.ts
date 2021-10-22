'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Generate } from "./commands/generate";
import { Lint } from "./commands/lint";
import { Compile } from "./commands/compile";
import { umpleTree } from "./commands/UmpleTree";
import { LocalStorageService } from "./helpers/LocalStorageProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed



export function activate(context: vscode.ExtensionContext) {
    let storageManager = new LocalStorageService(context.globalState);
    context.subscriptions.push(
        new Generate(),
        new Compile(storageManager),
        new Lint(storageManager)
    );
    vscode.window.registerTreeDataProvider('umple-actions', umpleTree);

}

// this method is called when your extension is deactivated
export function deactivate() {
}