import { TextDocument, Uri, workspace } from "vscode";
import { umpleAPI, Result } from "../umpleAPI";
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
    try {
        const res = await umpleAPI.generate(textDocument, "Java", workspace.asRelativePath("build"));
        umpleLint.clearFile(textDocument);
        umpleLint.lintFile(textDocument, res);

    } catch (e) {
        const err = e as Result[];
        umpleLint.lintFile(textDocument, err)
    }
}