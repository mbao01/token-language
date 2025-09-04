import { TextDocuments } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

// Create a simple text document manager.
export const documents = new TextDocuments(TextDocument);
