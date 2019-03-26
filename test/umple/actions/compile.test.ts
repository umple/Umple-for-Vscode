import * as vscode from "vscode";
import * as path from "path";
import { getExtensionPath } from "../../../src/umple/util";
import * as simple from "simple-mock";
import { compile } from "../../../src/umple/actions/compile";

describe("compile.ts", function () {
    const umpleFolder = path.join(getExtensionPath(), "resources", "umple");

    beforeEach(function () {
        simple.mock(vscode.window, "showInputBox").resolveWith("Student");

    });
    it("runs compile", async function () {
        await vscode.window.onDidChangeActiveTextEditor(async () => {
            await compile();
        });

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(umpleFolder, "test.ump")));
        await vscode.window.showTextDocument(doc);

    });

    afterEach(function () {
        simple.restore();
    });

});