import {
  InitializeError,
  InitializeParams,
  InitializeResult,
  ServerRequestHandler,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";
import { CAPABILITIES } from "../../server/capabilities";

export const handleInitialize: ServerRequestHandler<
  InitializeParams,
  InitializeResult,
  never,
  InitializeError
> = (params: InitializeParams) => {
  connection.console.log("✅ Token Language Server initialized");

  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  CAPABILITIES.hasConfigurationCapability = Boolean(
    capabilities.workspace && capabilities.workspace.configuration
  );
  CAPABILITIES.hasWorkspaceFolderCapability = Boolean(
    capabilities.workspace && capabilities.workspace.workspaceFolders
  );
  CAPABILITIES.hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      definitionProvider: true,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [".", "-", "_", "!"],
      },
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      workspace: {
        fileOperations: {
          didCreate: {
            filters: [{ pattern: { glob: "**/tokens/**/*.json" } }],
          },
          didRename: {
            filters: [{ pattern: { glob: "**/tokens/**/*.json" } }],
          },
          didDelete: {
            filters: [{ pattern: { glob: "**/tokens/**/*.json" } }],
          },
        },
      },
    },
  };
  if (CAPABILITIES.hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      ...result.capabilities.workspace,
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
};
