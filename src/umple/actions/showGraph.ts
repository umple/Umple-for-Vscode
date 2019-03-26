import * as vscode from "vscode";
import * as path from "path";
import { umpleAPI, GRAPH_LANGS } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";

export async function showGraph() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("Error occurred window");
        return;
    }

    if (!path.isAbsolute(editor.document.fileName)) {
        vscode.window.showInformationMessage("Error occurred filename");
        return;
    }

    const format = await vscode.window.showQuickPick(GRAPH_LANGS);

    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }

    const res = await umpleAPI.graph(editor.document.uri, format, vscode.workspace.asRelativePath("build"));
    umpleLint.lintFile(editor.document.uri, res);

    if (res[0].state === 'success') {
        if (vscode.extensions.getExtension("EFanZh.graphviz-preview") !== undefined) {

            vscode.commands.executeCommand("graphviz.showPreview");
        } else {
            vscode.window.showWarningMessage("GraphViz Preview Extension is required to show diagrams");

        }
    }
}


