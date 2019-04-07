import { getExtensionPath } from "./util";
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as path from "path";


export const GENERATE_LANGS = ["Java", "Php", "Cpp", "Ruby", "Sql", "Umple"];
export const COMPILE_LANGS = ["Java"];

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
        if ((GENERATE_LANGS.indexOf(language) < 0)) {
            return Promise.reject("language not supported");
        }
        return this.runCommand(uri, "-g", language, outputLocation);
    }

    compile(uri: vscode.Uri, outputLocation?: string): Promise<Result[]> {
        return this.runCommand(uri, "-c-", outputLocation);
    }

    private runCommand(uri: vscode.Uri, action: string, extra?: string, outputLocation?: string): Promise<Result[]> {
        if (!this._extensionPath) {
            this._extensionPath = getExtensionPath();
        }
        const params = [];
        params.push(
            "java",
            "-jar",
            path.join(this._extensionPath, "umple.jar"),
            action,
        );

        if(extra) {
            params.push(extra);
        }

        if (outputLocation) {
            params.push("--path", outputLocation);
        }

        params.push(uri.fsPath);


        const command = params.join(" ");
        return new Promise((resolve, reject) => {
            child_process.exec(command, (err, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                resolve(this.parseError(stderr, stdout));
            });
        });
    }


    parseError(error: string, stdout: string): Result[] {
        const lines = error.split("\n");
        const results: Result[] = [];
        let errorFound: boolean = false;
        while (lines.length > 0) {

            if (lines[0].match(/.*\.ump\:\d*\:.*/)) {
                results.push(this.parseJavaError(lines[0], lines[1], lines[2], lines[3], lines[4]));
                errorFound = true;
                lines.shift();
                lines.shift();
                lines.shift();
                lines.shift();
                lines.shift();
            } else if (lines[0].startsWith("Error") || lines[0].startsWith("Warning")) {
                //Error 1502 on line 5 of file 'test-fail.ump':
                const errorMeta = lines[0].split(" ");
                const errorMessage = lines[1];

                let [umpleState, code, , , lineNum, , , fileName] = errorMeta;
                //remove quotes and colon
                fileName = fileName.slice(0, -2).substr(1);

                let state: Result["state"] = "success";
                // for typechecking
                switch (umpleState.toLowerCase()) {
                    case 'error':
                        state = 'error';
                        errorFound = true;
                        break;
                    case 'warning':
                        state = 'warning';
                        break;
                }
                results.push({ state, code, lineNum: Number(lineNum), fileName, message: errorMessage });
                lines.shift();
                lines.shift();
            } else {
                lines.shift();
            }
        }

        if (!errorFound) {
            const out = stdout.split('\n');
            const index = out.findIndex(str => str.startsWith('Success'));
            return [{ state: 'success', message: index < 0 ? stdout : out[index] }, ...results];
        }

        return results;
    }

    parseJavaError(err: string, lineofCode: string, pointer: string, symbol: string, location: string): Result {
        //test.ump:5: error: cannot find symbol
        const [fileName, lineNum, , message] = err.split(':');
        let msg = `${message.trim()}\n${lineofCode}\n${pointer}\n${symbol.trim()}\n${location.trim()}`;
        return { fileName: fileName, lineNum: Number(lineNum), state: 'error', message: msg };
    }

}

export const umpleAPI = new UmpleAPI();



