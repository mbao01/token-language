import * as path from "path";
import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  console.log("🚀 Token Language Extension activated");

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("packages", "server", "out", "server.js")
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  const srcPackage = workspace.getConfiguration("tokenLanguage").get("tokens.srcPackage");

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: "file", language: "plaintext" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "javascriptreact" },
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "typescriptreact" },
      { scheme: "file", language: "css" },
      { scheme: "file", language: "scss" },
      { scheme: "file", language: "json" },
    ],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher(`${srcPackage}/src/**/*.json`),
    },
    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "tokenLanguage",
    "Token Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  console.log("🟢 Token Language Extension started");
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }

  console.log("🛑 Token Language Extension deactivated");
  return client.stop();
}
