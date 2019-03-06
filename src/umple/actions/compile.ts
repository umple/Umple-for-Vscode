import * as vscode from "vscode";
import * as path from "path";
import { umpleAPI } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";

export async function compile() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("Error occurred window");
        return;
    }

    if (!path.isAbsolute(editor.document.fileName)) {
        vscode.window.showInformationMessage("Error occurred filename");
        return;
    }

    const format = await vscode.window.showInputBox({ prompt: 'Entry class' });

    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }

    const res = await umpleAPI.compile(editor.document.uri, format);
    umpleLint.lintFile(editor.document.uri, res);
    if (res[0].state === 'success' && res[0].message) {
        vscode.window.showInformationMessage(res[0].message || '');
    }
}


