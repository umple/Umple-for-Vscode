import { TextDocument, Uri, workspace } from "vscode";
import { umpleAPI } from "../umpleAPI";
import { umpleLint } from "../../helpers/UmpleLintingProvider";

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
    umpleLint.lintFile(textDocument, res);
}