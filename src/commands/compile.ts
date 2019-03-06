import { Disposable, commands } from "vscode";
import { compile } from "../umple/actions/compile";

export class Compile extends Disposable {

    private _disposable: Disposable;

    constructor() {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.compile", this.execute, this);
    }


    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute(...args: any[]) {
        await compile();
    }
}