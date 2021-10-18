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

    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }

    const res = await umpleAPI.generate(editor.document.uri, format);
    umpleLint.lintFile(editor.document.uri, res);
    if (res[0].state === 'success' && res[0].message) {
        var extension =  format == 'Ruby'? 'rb' :format=='Umple'?'ump':format.toLowerCase();
        var message = res[0].message.replace('.ump','.'+ extension);
        vscode.window.showInformationMessage(message || '');
    }
    if(res[1].state == 'error' && res[1].message){
        vscode.window.showInformationMessage( res[1].message || '');
    }
}


