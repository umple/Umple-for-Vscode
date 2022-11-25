import * as vscode from "vscode";
import { Result } from "../umple/umpleAPI";
import { getExtensionPath } from "../umple/util";
import * as path from 'path';
import * as fs from 'fs';


class UmpleLintingProvider {

    private diagnosticCollection: vscode.DiagnosticCollection;
    private errorCodeMap: Map<string, string>;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        this.errorCodeMap = this.getErrorCodeMap();
    }


    lintFile(fileUri: vscode.Uri, results: Result[]) {
        this.clearFile(fileUri);
        if (this.diagnosticCollection.has(fileUri)) {
            this.diagnosticCollection.delete(fileUri);
        }
        const diagnostics = this.convertToDiagnostics(results);

        this.diagnosticCollection.set(fileUri, diagnostics);
    }

    convertToDiagnostics(results: Result[]): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        results.forEach((result) => {
            let code: string | {value: string | number, target: vscode.Uri}
            code = result.code || ''; 
            if (this.errorCodeMap.get(code))
                code = {value: result.code || parseInt(result.code!), target: vscode.Uri.parse(this.errorCodeMap.get(code)?.trim()!)};
            const message = result.message || '';
            const lineNum = result.lineNum || 1;
            const range = new vscode.Range(new vscode.Position(lineNum - 1, 0), new vscode.Position(lineNum - 1, 255));
            switch (result.state) {
                case 'warning':
                    diagnostics.push({
                        code,
                        message,
                        range,
                        severity: vscode.DiagnosticSeverity.Warning
                    });
                    break;
                case 'error':
                    diagnostics.push({
                        code,
                        message,
                        range,
                        severity: vscode.DiagnosticSeverity.Error
                    });
                    break;
            };

        });
        return diagnostics;
    }


    clearFile(fileUri: vscode.Uri) {
        if (this.diagnosticCollection.has(fileUri)) {
            this.diagnosticCollection.delete(fileUri);
        }
    }

    // Read the file to get error code and urls
    getErrorCodeMap(): Map<string, string> {
        let filePath = path.join(getExtensionPath(), 'src', 'en.error')
        let text = fs.readFileSync(filePath,'utf8');
        let pairs = text.split("\n").map(chunk => chunk.split(",") as [string, string]); 
        const errMap = new Map<string, string>(pairs);
        return errMap;
    }
}

export const umpleLint = new UmpleLintingProvider();