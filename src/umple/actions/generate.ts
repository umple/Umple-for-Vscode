import * as vscode from "vscode";
import * as path from "path";
import { GENERATE_LANGS, umpleAPI } from "../umpleAPI";
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

    if(!format){
        vscode.window.showInformationMessage("No language is selected");
        return;
    }

    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }

    const res = await umpleAPI.generate(editor.document.uri, format);
    umpleLint.lintFile(editor.document.uri, res);
    if (res[0].state === 'success' && res[0].message) {
        vscode.window.showInformationMessage(res[0].message || '');
    }
}


