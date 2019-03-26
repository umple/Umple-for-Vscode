import * as child_process from "child_process";
import * as vscode from "vscode";


export function testJava(): boolean {
    child_process.execSync("java -version");
    return true;
}

export function compileJava(uri: vscode.Uri): boolean {
    try {
        child_process.execSync(`javac ${uri.toString(true)}`);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function testUmple(): boolean {
    child_process.execSync(`java -jar ${getExtensionPath()}/umple.jar -version`);
    return true;
}

export function getExtensionPath(): string {
    let extension = vscode.extensions.getExtension("digized.umple");
    if (!extension) {
        throw Error("Cannot find Extension");
    }
    return extension.extensionPath;
}