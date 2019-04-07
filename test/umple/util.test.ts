import { testJava, testUmple, getExtensionPath, compileJava } from "../../src/umple/util";
import * as assert from "assert";
import { Uri } from "vscode";
import * as path from "path";
import * as glob from "glob";
import * as fs from "fs";

describe("util.ts", function () {
    this.slow(350);
    describe("#testJava", function () {
        it("should verify java exists on development machine", function () {
            assert.equal(testJava(), true);
        });
    });


    describe("#getExtensionPath", function () {
        it("should verify extension is installed", function () {
            assert.notEqual(getExtensionPath(), "");
        });
    });

    describe("#compileJava", function () {

        const javaFolder = path.join(getExtensionPath(), "resources", "java");

        it("should compile test java file and pass", function () {
            console.log(javaFolder);
            const javaFile = Uri.file(path.join(javaFolder, "Person.java"));
            assert.equal(compileJava(javaFile), true);
        });

        afterEach(function () {
            glob("*.class", { cwd: javaFolder }, (err, matches) => {
                matches.map(match => fs.unlink(path.join(javaFolder, match), (err) => { }));
            });
        });
    });

    describe("#testUmple", function () {
        it("should verify Umple is in the root directory of the extension", function () {
            assert.equal(testUmple(), true);
        });
    });


});