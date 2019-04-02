import { Disposable, workspace, commands } from "vscode";
import { lint } from "../umple/actions/lint";

export class Lint extends Disposable {
    private _disposable: Disposable;

    constructor() {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.lint", this.execute, this);
        workspace.onDidSaveTextDocument(lint);
        workspace.onDidOpenTextDocument(lint);
    }
    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute() {
    }
}