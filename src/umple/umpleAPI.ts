import { getExtensionPath } from "./util";
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as path from "path";


export const GENERATE_LANGS = ["Java", "Php", "Cpp", "Ruby", "Sql", "Umple"];

export interface Result {
    state: 'success' | 'error' | 'warning';
    code?: string;
    lineNum?: number;
    fileName?: string;
    message?: string;
}

class UmpleAPI {
    private _extensionPath: string | undefined;

    generate(uri: vscode.Uri, language: string, outputLocation?: string): Promise<Result[]> {
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
        );

        if (outputLocation) {
            params.push("--path", outputLocation);
        }

        params.push(uri.fsPath);

        const command = params.join(" ");
        return new Promise((resolve, reject) => {
            child_process.exec(command, (err, stdout, stderr) => {
                if (stderr && stderr !== "") {
                    if (stderr.startsWith("Error")) { // Error
                        reject(this.parseError(stderr));
                    } else if (stderr.startsWith("Warning")) {
                        resolve(this.parseError(stderr));
                    }
                } else {
                    resolve([{ state: "success", message: stdout }]);
                }
            });
        });
    }

    parseError(error: string): Result[] {
        const lines = error.split("\n");

        //Error 1502 on line 5 of file 'test-fail.ump':
        const errorMeta = lines[0].split(" ");
        const errorMessage = lines[1];

        let [umpleState, code, , , lineNum, , , fileName] = errorMeta;
        fileName = fileName.slice(0, -2).substr(1);

        let state: Result["state"] = "success";
        switch (umpleState.toLowerCase()) {
            case 'error':
                state = 'error';
                break;
            case 'warning':
                state = 'warning';
                break;
        }


        return [{ state, code, lineNum: Number(lineNum), fileName, message: errorMessage }];
    }

}

export const umpleAPI = new UmpleAPI();



