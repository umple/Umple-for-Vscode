import { Disposable, commands} from "vscode";
import { LocalStorageService } from "../helpers/LocalStorageProvider";
import { compile } from "../umple/actions/compile";

export class Compile extends Disposable {

    private _disposable: Disposable;
    private _storageService: LocalStorageService;
    

    constructor(storageService: LocalStorageService) {
        super(() => this.dispose());
        this._disposable = commands.registerCommand("umple.compile", this.execute, this);
        this._storageService = storageService;
        this._storageService.setValue<boolean>("isCompiling",false);
    }


    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    async execute(...args: any[]) {
        await compile(this._storageService);
    }
}