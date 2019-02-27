import * as vscode from "vscode";
import * as path from "path";
import { GENERATE_LANGS, umpleAPI, Result } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";

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
        if (res[0].state === 'success' && res[0].message) {
            vscode.window.showInformationMessage(res[0].message || '');
            umpleLint.lintFile(editor.document.uri, []);

        }
    } catch (e) {
        const err = e as Result[];

        umpleLint.lintFile(editor.document.uri, err)
        vscode.window.showErrorMessage(err[0].message || '');
    }
}


