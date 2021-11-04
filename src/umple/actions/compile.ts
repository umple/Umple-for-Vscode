import * as vscode from "vscode";
import * as path from "path";
import { umpleAPI } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";
import { LocalStorageService } from "../../helpers/LocalStorageProvider";

export async function compile(storageService: LocalStorageService) {
 let isCompiling = storageService.getValue("isCompiling"); 

if (isCompiling) {
   // vscode.window.showInformationMessage("Compilation already in progress.");
    return;
}
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("Cannot access editor window");
        return;
    }

    if (!path.isAbsolute(editor.document.fileName)) {
        vscode.window.showInformationMessage("Cannot access file");
        return;
    }
    vscode.window.showInformationMessage('Compile in progress...');
    //test the async flow here
    storageService.setValue<boolean>("isCompiling",true);
    const res = await umpleAPI.compile(editor.document.uri);
    umpleLint.lintFile(editor.document.uri, res);
    if (res[0].state === 'success' && res[0].message) {
        vscode.window.showInformationMessage(res[0].message || '');
    }
    //test the async flow here
    storageService.setValue<boolean>("isCompiling",false);
}


