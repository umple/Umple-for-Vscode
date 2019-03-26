import { Disposable, commands } from "vscode";
import { showGraph } from "../umple/actions/showGraph";

export class ShowGraph extends Disposable {

    private _disposable: Disposable;

    constructor() {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.showGraph", this.execute, this);
    }


    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute(...args: any[]) {
        await showGraph();
    }
}