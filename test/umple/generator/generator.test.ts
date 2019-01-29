import { generate } from "../../../src/umple/actions/generate";
import * as vscode from "vscode";
import * as path from "path";
import { getExtensionPath } from "../../../src/umple/util";
import * as simple from "simple-mock";

describe("generator.ts", function () {
    const umpleFolder = path.join(getExtensionPath(), "resources", "umple");

    beforeEach(function () {
        simple.mock(vscode.window, "showQuickPick").resolveWith("Java");

    });
    it("runs generate", async function () {
        await vscode.window.onDidChangeActiveTextEditor(async () => {
            await generate();
        });

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(umpleFolder, "test.ump")));
        await vscode.window.showTextDocument(doc);

    });

    afterEach(function () {
        simple.restore();
    });

});