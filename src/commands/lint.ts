import { Disposable, workspace, commands } from "vscode";
import { LocalStorageService } from "../helpers/LocalStorageProvider";
import { lint, lintChange } from "../umple/actions/lint";

export class Lint extends Disposable {
    private _disposable: Disposable;
    public static _storage : LocalStorageService;
   

    constructor(storageService: LocalStorageService) {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.lint", this.execute, this);
        Lint._storage = storageService;
        workspace.onDidSaveTextDocument(lint);
        workspace.onDidOpenTextDocument(lint);
        workspace.onDidChangeTextDocument(lintChange);
    }
    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute() {
    }
}