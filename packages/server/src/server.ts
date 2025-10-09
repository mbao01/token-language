import { documents } from "./server/documents";
import { connection } from "./server/connection";
import {
  handleDocumentClose,
  handleDocumentContentChange,
} from "./events/document";
import {
  handleConfigurationChange,
  handleFileChange,
  handleInitialized,
} from "./events/notification";
import {
  handleCompletion,
  handleCompletionResolve,
  handleDefinition,
  handleDiagnostics,
  handleHover,
  handleReferences,
} from "./events/request";
import { handleInitialize } from "./events/request";

/* --------- Client Requests --------- */
// emitted when an initialization request is received from client
connection.onInitialize(handleInitialize);

// handles diagnostics for workspace/single file
connection.languages.diagnostics.on(handleDiagnostics);

/* --------- Client Notifications --------- */
// emitted after connection has been initialized with client
connection.onInitialized(handleInitialized);

// emitted when configuration changes e.g settings
connection.onDidChangeConfiguration(handleConfigurationChange);

// emitted when watched files change
connection.onDidChangeWatchedFiles(handleFileChange);

/* --------- User Requests --------- */
// emitted when an item is hovered on
connection.onHover(handleHover);

/* --------- User Requests --------- */
// emitted when a references is requested for an item
connection.onReferences(handleReferences);

// emitted when an item definition is requested
connection.onDefinition(handleDefinition);

// emitted when completion items are requested
connection.onCompletion(handleCompletion);

// emitted for a selected completion item to return more info about the item
connection.onCompletionResolve(handleCompletionResolve);

/* --------- Document Events --------- */
// emitted when a document is closed
documents.onDidClose(handleDocumentClose);

// emitted when the text document first opened or when its content has changed.
documents.onDidChangeContent(handleDocumentContentChange);

/* --------- Listen --------- */
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
