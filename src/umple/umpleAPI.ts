import { getExtensionPath } from "./util";
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as path from "path";


export const GENERATE_LANGS = ["Java", "Php"];

export interface Result {
    success: boolean;
    message?: string;
}


class UmpleAPI {
    private _extensionPath: string | undefined;

    generate(uri: vscode.Uri, language: string): Promise<Result> {
        if (GENERATE_LANGS.indexOf(language) < 0) {
            return Promise.reject("language not supported");
        }
        if (!this._extensionPath) {
            this._extensionPath = getExtensionPath();
        }
        const params = [];
        params.push(
            "java",
            "-jar",
            path.join(this._extensionPath, "umple.jar"),
            "-g",
            language,
            uri.fsPath
        );
        const command = params.join(" ");
        return new Promise((resolve, reject) => {
            child_process.exec(command, (err, stdout, stderr) => {
                console.log(err, stderr, stdout);
                if (stderr && stderr !== "" && stderr.startsWith("Error")) {
                    reject(stderr);
                } else {
                    resolve({ success: true, message: stdout });
                }
            });
        });
    }

}

export const umpleAPI = new UmpleAPI();



