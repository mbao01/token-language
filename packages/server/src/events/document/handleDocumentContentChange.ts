import { TextDocumentChangeEvent } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { validateTextDocument } from "../../helpers/validateDocument";
import { CAPABILITIES } from "../../server/capabilities";

export const handleDocumentContentChange = (
  change: TextDocumentChangeEvent<TextDocument>
) => {
  validateTextDocument(change.document, CAPABILITIES);
};
