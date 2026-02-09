import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { checkJava, updateUmpleSyncJar } from "./utils/umpleSync";

let client: LanguageClient | undefined;

// Start the client with server side attached
export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Check for Java
  if (!checkJava()) {
    vscode.window.showErrorMessage(
      "Java is required for Umple LSP. Please install Java and restart VS Code.",
    );
    return;
  }

  // Resolve server package directory
  const serverDir = path.dirname(
    require.resolve("umple-lsp-server/package.json"),
  );

  // Update umplesync.jar if needed (downloads into server package dir)
  await updateUmpleSyncJar(serverDir);

  const serverModule = require.resolve("umple-lsp-server/out/server.js");

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "umple" }],
    initializationOptions: {
      umpleSyncJarPath: path.join(serverDir, "umplesync.jar"),
      umpleSyncPort: 5556,
    },
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.ump"),
    },
  };

  client = new LanguageClient(
    "umpleLanguageServer",
    "Umple Language Server",
    serverOptions,
    clientOptions,
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }

  return client.stop();
}
