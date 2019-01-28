import * as assert from 'assert';
import { umpleAPI } from '../../src/umple/umpleAPI';
import { Uri } from 'vscode';
import { getExtensionPath, compileJava } from '../../src/umple/util';
import * as path from "path";
import * as glob from "glob";
import * as fs from "fs";

describe("UmpleAPI.ts", function () {
    const extensionPath = getExtensionPath();
    const umpleFolder = path.join(extensionPath, "resources", "umple");

    describe("UmpleApi", function () {
        describe.only("#generate", function () {
            this.timeout(5000);
            it("should generate java code for a test umple file", async function () {
                const umpleFile = Uri.parse(path.join(umpleFolder, "test.ump"));
                const result = await umpleAPI.generate(umpleFile, "Java");
                assert.equal(result.success, true);
                assert.equal(compileJava(Uri.parse(path.join(umpleFolder, "Person.java"))), true);
            });

            it("should fail for an incorrect file", async function () {
                const umpleFile = Uri.parse(path.join(umpleFolder, "test-fail.ump"));
                try {
                    await umpleAPI.generate(umpleFile, "Java");
                } catch (err) {
                    console.log("Asdasdsa", err);

                }
                assert.equal(compileJava(Uri.parse(path.join(umpleFolder, "Student.java"))), true);
            });
        });

        afterEach(function () {
            glob("!(*.ump)", { cwd: umpleFolder }, (err, matches) => {
                matches.map(match => fs.unlink(path.join(umpleFolder, match), (err) => { }));
            });
        });
    });

});
