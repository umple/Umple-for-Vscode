import * as vscode from "vscode";
import * as path from "path";
import { getExtensionPath } from "../../../src/umple/util";
import * as simple from "simple-mock";
import { compile } from "../../../src/umple/actions/compile";
import { LocalStorageService } from "../../../src/helpers/LocalStorageProvider";

describe("compile.ts", function () {
    const umpleFolder = path.join(getExtensionPath(), "resources", "umple");

    beforeEach(function () {
        simple.mock(vscode.window, "showInputBox").resolveWith("Student");

    });
    it("runs compile", async function () {
        await vscode.window.onDidChangeActiveTextEditor(async () => {
            const get = simple.stub();
            const update = simple.stub();
            const keys = simple.stub();
            const memento: vscode.Memento = {
                get,
                update,
                keys
            }
            const storageService = new LocalStorageService(memento)
            await compile(storageService);
        });

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(umpleFolder, "test.ump")));
        await vscode.window.showTextDocument(doc);

    });

    afterEach(function () {
        simple.restore();
    });

});