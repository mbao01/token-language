import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentDiagnosticReportKind,
  type DocumentDiagnosticReport,
  Position,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { validateTextDocument } from "./helpers/validateDocument";
import {
  deleteDocumentSettings,
  setGlobalSettings,
} from "./helpers/getDocumentSettings";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents = new TextDocuments(TextDocument);

const capabilitiesOptions = {
  hasConfigurationCapability: false,
  hasWorkspaceFolderCapability: false,
  hasDiagnosticRelatedInformationCapability: false,
};

connection.onInitialize((params: InitializeParams) => {
  connection.console.log("✅ Token Language Server initialized");

  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  capabilitiesOptions.hasConfigurationCapability = Boolean(
    capabilities.workspace && capabilities.workspace.configuration
  );
  capabilitiesOptions.hasWorkspaceFolderCapability = Boolean(
    capabilities.workspace && capabilities.workspace.workspaceFolders
  );
  capabilitiesOptions.hasDiagnosticRelatedInformationCapability = !!(
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
  if (capabilitiesOptions.hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      ...result.capabilities.workspace,
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (capabilitiesOptions.hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (capabilitiesOptions.hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

connection.onDidChangeConfiguration((change) => {
  connection.console.log("⚙️ Configuration changed");

  setGlobalSettings(change.settings?.tokenLanguage);

  // Refresh the diagnostics since the `maxNumberOfProblems` could have changed.
  // We could optimize things here and re-fetch the setting first can compare it
  // to the existing setting, but this is out of scope for this example.
  connection.languages.diagnostics.refresh();
});

// Only keep settings for open documents
documents.onDidClose((e) => {
  deleteDocumentSettings(e.document.uri);
});

connection.languages.diagnostics.on(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (document !== undefined) {
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: await validateTextDocument(
        connection.workspace,
        document,
        capabilitiesOptions
      ),
    } satisfies DocumentDiagnosticReport;
  } else {
    // We don't know the document. We can either try to read it from disk
    // or we don't report problems for it.
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: [],
    } satisfies DocumentDiagnosticReport;
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(
    connection.workspace,
    change.document,
    capabilitiesOptions
  );
});

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received a file change event");
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
      {
        label: "TypeScript",
        kind: CompletionItemKind.Text,
        data: 1,
      },
      {
        label: "JavaScript",
        kind: CompletionItemKind.Text,
        data: 2,
      },
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = "TypeScript details";
    item.documentation = "TypeScript documentation";
  } else if (item.data === 2) {
    item.detail = "JavaScript details";
    item.documentation = "JavaScript documentation";
  }
  return item;
});

connection.onHover((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return;

  const word = getWordAtPosition(doc, params.position);
  if (!word) return;

  // Example: lookup token value
  const value = word; // tokens is your shared/global token object
  // const value = tokens[word]; // tokens is your shared/global token object
  if (!value) return;

  return {
    contents: {
      kind: "markdown",
      value: `**${word}**: ${value}`,
    },
  };
});

function getWordAtPosition(
  doc: TextDocument,
  position: Position
): string | null {
  const line = doc.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line + 1, character: 0 },
  });
  const regex = /\b\w+(\.\w+)*\b/g; // matches token-like words
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position.character >= start && position.character <= end) {
      return match[0];
    }
  }
  return null;
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
