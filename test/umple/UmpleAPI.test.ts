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
        describe("#generate", function () {
            this.timeout(10000);
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
                    assert.fail();
                } catch (err) {
                    assert.ok(err);
                }
            });
        });

        afterEach(function () {
            glob("!(*.ump)", { cwd: umpleFolder }, (err, matches) => {
                matches.map(match => fs.unlink(path.join(umpleFolder, match), (err) => { }));
            });
        });
    });

});
