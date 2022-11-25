import * as vscode from "vscode";
import * as path from "path";
import { GENERATE_LANGS, umpleAPI } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";
import { Lint } from "../../commands/lint";

export async function generate() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("Error occurred window");
        return;
    }

    if (!path.isAbsolute(editor.document.fileName)) {
        vscode.window.showInformationMessage("Error occurred filename");
        return;
    }

    const format = await vscode.window.showQuickPick(GENERATE_LANGS);

    if (!format) {
        vscode.window.showInformationMessage("No language is selected");
        return;
    }
    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }
    const containsError = Lint._storage.getValue("containsCompileError");
    if (containsError) {
        const resp = await vscode.window
        .showInformationMessage(
          "Your umple code has an error. Do you want to generate the code based on the last successful compile?",
          ...["Yes", "No"]
        );
   
        if (resp === "No") {
            return;
        }
    }

    const outputLocation = vscode.workspace.asRelativePath(format.replace(/\s/g, ""));
    const res = await umpleAPI.generate(editor.document.uri, format, outputLocation);
    umpleLint.lintFile(editor.document.uri, res);
    
    if (res[0].state === 'success' && res[0].message) {
        vscode.window.showInformationMessage(res[0].message || '');
    }
    
}
