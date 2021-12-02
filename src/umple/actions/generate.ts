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

    if(!format){
        vscode.window.showInformationMessage("No language is selected");
        return;
    }
    if (!format || !editor.document.uri) {
        vscode.window.showInformationMessage("Error occurred format");
        return;
    }
    const containsError = Lint._storage.getValue("containsCompileError");
    if(containsError){
        const resp = await vscode.window
        .showInformationMessage(
          "Your umple code has an error. Do you want to generate the code based on the last successful compile?",
          ...["Yes", "No"]
        );
   
          if (resp === "No") {
            return;
          }else{
            const res = await umpleAPI.generate(editor.document.uri, format);
            umpleLint.lintFile(editor.document.uri, res);
            if (res[0].state === 'success' && res[0].message) {
                const extension =  format == 'Ruby'? 'rb' :format=='Umple'?'ump':format.toLowerCase();
                const message = res[0].message.replace('.ump','.'+ extension);
                vscode.window.showInformationMessage(message || '');
            }
            if(res[1].state == 'error' && res[1].message){
                vscode.window.showInformationMessage( res[1].message || '');
            }
          }
    }
    else{
        const res = await umpleAPI.generate(editor.document.uri, format);
        umpleLint.lintFile(editor.document.uri, res);
        if (res[0].state === 'success' && res[0].message) {
            const extension =  format == 'Ruby'? 'rb' :format=='Umple'?'ump':format.toLowerCase();
            const message = res[0].message.replace('.ump','.'+ extension);
            vscode.window.showInformationMessage(message || '');
        }
        if(res[1].state == 'error' && res[1].message){
            vscode.window.showInformationMessage( res[1].message || '');
        }
    }
}
