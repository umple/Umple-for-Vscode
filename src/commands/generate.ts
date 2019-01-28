import { Disposable, commands } from "vscode";
import { generate } from "../umple/actions/generate";

export class Generate extends Disposable {

    private _disposable: Disposable;

    constructor() {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.generate", this.execute, this);
    }


    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute(...args: any[]) {
        await generate();
    }
}