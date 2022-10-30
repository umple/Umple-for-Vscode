import * as child_process from "child_process";
import * as vscode from "vscode";
import * as fs from 'fs';


export function testJava(): boolean {
    child_process.execSync("java -version");
    return true;
}

export function compileJava(uri: vscode.Uri): boolean {
    try {
        child_process.execSync(`javac ${uri.fsPath}`);
        return true;
    } catch (err) {
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

export function updateUmple() {
    let config = vscode.workspace.getConfiguration("umple");
    if (!config.get('update')) {
        return;
    }
    
    let latestVersion: string;
    try {
        latestVersion = child_process.execSync(`curl -L https://cruise.umple.org/umpleonline/scripts/versionRunning.txt`).toString();
        latestVersion = latestVersion.trim();
    } catch (error) {
        return;
    }

    if (fs.existsSync(`${getExtensionPath()}/umple.jar`)) {
        let currentVersion = child_process.execSync(`java -jar ${getExtensionPath()}/umple.jar -v`).toString().replace("Version: ", "");
        currentVersion = currentVersion.trim();
        if (latestVersion !== currentVersion) {
            child_process.execSync(`curl https://try.umple.org/scripts/umple.jar --output ${getExtensionPath()}/umple.jar`);
        }
    } else {
        child_process.execSync(`curl https://try.umple.org/scripts/umple.jar --output ${getExtensionPath()}/umple.jar`);
    }

    
}