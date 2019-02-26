import { Disposable, workspace, commands, Uri } from "vscode";
import { lint } from "../umple/actions/lint";
import { } from "fs";

export class Lint extends Disposable {
    private _disposable: Disposable;

    constructor() {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.lint", this.execute, this);
        workspace.onDidSaveTextDocument(lint);
        this.execute();

    }
    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute() {
        await workspace.saveAll();
        const uris = await workspace.findFiles("**/[!build]*.ump");
        uris.forEach(uri => {
            lint(uri);
        });

    }
}