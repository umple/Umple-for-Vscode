import { TextDocument, TextDocumentChangeEvent, Uri, workspace } from "vscode";
import { umpleAPI } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";
import { Lint } from "../../commands/lint";


export async function lint(textDocument: TextDocument | Uri) {
    if (!(textDocument instanceof Uri)) {
        if (textDocument.languageId !== 'umple') {
            return;
        } else {
            lint(textDocument.uri);
            return;
        }
    }
    // will always be a uri here
    const res = await umpleAPI.generate(textDocument, "Java", workspace.asRelativePath("build"));
    if(res.some(x=>x.state!='success' && x.code && parseInt(x.code) >1000)){
        Lint._storage.setValue<boolean>("containsCompileError",true);
    }else{
        Lint._storage.setValue<boolean>("containsCompileError",false);
    }
    umpleLint.lintFile(textDocument, res);
}

export async function lintChange(textChange:TextDocumentChangeEvent ){
    console.log(textChange);
    await textChange.document.save();
    lint(textChange.document);

}