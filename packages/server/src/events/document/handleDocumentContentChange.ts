import { TextDocumentChangeEvent } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { validateTextDocument } from "../../helpers/validateDocument";
import { CAPABILITIES } from "../../server/capabilities";
import { connection } from "../../server/connection";

export const handleDocumentContentChange = (
  change: TextDocumentChangeEvent<TextDocument>
) => {
  connection.console.log('📝 Document Changed: handleDocumentContentChange: start');
  validateTextDocument(change.document, CAPABILITIES);
  connection.console.log('📝 Document Changed: handleDocumentContentChange: end');
};
