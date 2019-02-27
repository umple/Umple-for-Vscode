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
        describe.only("#generate", function () {
            it("should generate java code for a test umple file", async () => {
                const umpleFile = Uri.parse(path.join(umpleFolder, "test.ump"));
                const result = await umpleAPI.generate(umpleFile, "Java");
                console.log("1", result);
                assert.equal(result[0].state, 'success');
                assert.equal(compileJava(Uri.parse(path.join(umpleFolder, "Person.java"))), true);
            });

            it("should fail for an incorrect file", async () => {
                const umpleFile = Uri.parse(path.join(umpleFolder, "test-fail.ump"));
                try {
                    console.log("1.5", umpleFile);
                    const result = await umpleAPI.generate(umpleFile, "Java");
                    console.log("2", result);

                    assert.fail();
                } catch (err) {
                    console.log("3", err);
                    assert.ok(err);
                }
            });
        });

        describe("#parseResult", function () {
            it("parses a basic error correctly", function () {
                const result = "Error 1502 on line 1 of file 'test-fail.ump':\nParsing error: Structure of 'class' invalid";

                const expect: Result[] = [{ state: "error", code: "1502", lineNum: 1, fileName: "test-fail.ump", message: "Parsing error: Structure of 'class' invalid" }];

                assert.deepEqual(umpleAPI.parseError(result), expect);


            });
            it("parses a basic warning correctly", function () {
                const result = "Warning 3 on line 3 of file 'test-fail.ump':\nThe lazy keyword is redundant when the attribute is being initialized - in class 'X3lazy'";
                const expect: Result[] = [{ state: "warning", code: "3", lineNum: 3, fileName: "test-fail.ump", "message": "The lazy keyword is redundant when the attribute is being initialized - in class 'X3lazy'" }]
                assert.deepEqual(umpleAPI.parseError(result), expect);


            });
        });

        afterEach(function () {
            glob("!(*.ump)", { cwd: umpleFolder }, (err, matches) => {
                matches.map(match => fs.unlink(path.join(umpleFolder, match), (err) => { }));
            });
        });
    });

});
