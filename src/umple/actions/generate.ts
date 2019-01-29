import * as vscode from "vscode";
import * as path from "path";
import { GENERATE_LANGS, umpleAPI } from "../umpleAPI";

export async function generate() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("Error occurred window");
        return;
    }

    if (!path.isAbsolute(editor.document.fileName)) {
        vscode.window.showInformationMessage("Error occurred filename");
        return;
    }

    const format = await vscode.window.showQuickPick(GENERATE_LANGS);

    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }

    try {
        const res = await umpleAPI.generate(editor.document.uri, format);
        if (res.success && res.message) {
            vscode.window.showInformationMessage(res.message);
        }
    } catch (e) {
        vscode.window.showErrorMessage(e);
    }
}


