import { Diagnostic, Position, Range, DiagnosticSeverity, Uri } from "vscode";
import { umpleLint } from "../../src/helpers/UmpleLintingProvider";
import { Result } from "../../src/umple/umpleAPI";
import * as assert from "assert";
import { getExtensionPath } from "../../src/umple/util";
import * as path from "path";

describe("UmpleLintingProvider.ts", function () {
    const extensionPath = getExtensionPath();
    const umpleFolder = path.join(extensionPath, "resources", "umple");
    describe("#convertToDiagnostics", function () {
        it("should map Results to Diagnostics correctly", function () {
            const results: Result[] = [
                { code: 'test', state: 'error', fileName: 'test', lineNum: 1 }
            ]
            const realDiagnostic = umpleLint.convertToDiagnostics(results);
            const expectedDiagnostic: Diagnostic[] = [
                {
                    code: 'test',
                    message: '',
                    range: new Range(new Position(0, 0), new Position(0, 255)),
                    severity: DiagnosticSeverity.Error,
                }
            ]
            assert.deepEqual(realDiagnostic, expectedDiagnostic);
        });
    });

    describe("#lintFile", function () {
        it("should lint correct file when specified", function () {
            const results: Result[] = [
                { code: 'test', state: 'error', fileName: 'test', lineNum: 1 }
            ]

            const umpleFile = Uri.parse(path.join(umpleFolder, "test-fail.ump"));

            umpleLint.lintFile(umpleFile, results);
            const expectedDiagnostic: Diagnostic[] = [
                {
                    code: 'test',
                    message: '',
                    range: new Range(new Position(0, 0), new Position(0, 255)),
                    severity: DiagnosticSeverity.Error,
                }
            ]
            const realDiagnostic = umpleLint['diagnosticCollection'].get(umpleFile)
            assert.deepEqual(realDiagnostic, expectedDiagnostic);
        });
    });
});