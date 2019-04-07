import * as assert from 'assert';
import { umpleAPI, Result } from '../../src/umple/umpleAPI';
import { Uri } from 'vscode';
import { getExtensionPath, compileJava } from '../../src/umple/util';
import * as path from "path";
import * as glob from "glob";
import * as fs from "fs";

describe("UmpleAPI.ts", function () {
    const extensionPath = getExtensionPath();
    const umpleFolder = path.join(extensionPath, "resources", "umple");

    describe("UmpleApi", function () {
        this.timeout(10000); //for travis purposes
        describe("#generate", function () {
            it("should generate java code for a test umple file", async () => {
                const umpleFile = Uri.file(path.join(umpleFolder, "test.ump"));
                const result = await umpleAPI.generate(umpleFile, "Java");
                assert.equal(result[0].state, 'success');
                assert.equal(compileJava(Uri.file(path.join(umpleFolder, "Person.java"))), true);
            });

            it("should fail for an incorrect file", async () => {
                const umpleFile = Uri.file(path.join(umpleFolder, "test-fail.ump"));
                const result = await umpleAPI.generate(umpleFile, "Java");
                assert.notEqual(result[0].state, 'success');

            });


        });

        describe("#compile", function () {
            it("should compile to java a test umple file", async () => {
                const umpleFile = Uri.file(path.join(umpleFolder, "test.ump"));
                const result = await umpleAPI.compile(umpleFile);
                assert.equal(result[0].state, 'success');
            });

            it("should fail for an incorrect file", async () => {
                const umpleFile = Uri.file(path.join(umpleFolder, "test-compile-fail.ump"));
                const result = await umpleAPI.compile(umpleFile);
                assert.notEqual(result[0].state, 'success');

            });


        });

        describe("#parseResult", function () {
            it("parses a umple generate error correctly", function () {
                const result = "Error 1502 on line 1 of file 'test-fail.ump':\nParsing error: Structure of 'class' invalid";

                const expect: Result[] = [{ state: "error", code: "1502", lineNum: 1, fileName: "test-fail.ump", message: "Parsing error: Structure of 'class' invalid" }];

                assert.deepEqual(umpleAPI.parseError(result, ""), expect);


            });
            it("parses a umple generate warning correctly", function () {
                const result = "Warning 3 on line 3 of file 'test-fail.ump':\nThe lazy keyword is redundant when the attribute is being initialized - in class 'X3lazy'";
                const expect: Result[] = [
                    { state: 'success', message: '' },
                    { state: "warning", code: "3", lineNum: 3, fileName: "test-fail.ump", "message": "The lazy keyword is redundant when the attribute is being initialized - in class 'X3lazy'" }
                ];
                assert.deepEqual(umpleAPI.parseError(result, ""), expect);


            });
            it("parses a umple compile error correctly", function () {
                const result = "test.ump:5: error: cannot find symbol\ntems = new String[2];\n ^ \nsymbol:   variable tems\n location: class A";
                const expect: Result[] = [
                    { state: "error", lineNum: 5, fileName: "test.ump", "message": "cannot find symbol\ntems = new String[2];\n ^ \nsymbol:   variable tems\nlocation: class A" }
                ];
                assert.deepEqual(umpleAPI.parseError(result, ""), expect);


            });
        });

        afterEach(function () {
            glob("!(*.ump)", { cwd: umpleFolder }, (err, matches) => {
                matches.map(match => fs.unlink(path.join(umpleFolder, match), (err) => { }));
            });
        });
    });

});
