import * as vscode from "vscode";
import { Result } from "../umple/umpleAPI";


class UmpleLintingProvider {

    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
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

            const code = result.code || '';
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
}

export const umpleLint = new UmpleLintingProvider();