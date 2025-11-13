import { TextDocumentWillSaveEvent } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { validateTextDocument } from "../../helpers/validateDocument";
import { CAPABILITIES } from "../../server/capabilities";
import { connection } from "../../server/connection";

export const handleDocumentWillSaveChange = (
  change: TextDocumentWillSaveEvent<TextDocument>
) => {
  connection.console.log('💾 Document Will Save: handleDocumentWillSaveChange: start');
  validateTextDocument(change.document, CAPABILITIES);
  connection.console.log('💾 Document Will Save: handleDocumentWillSaveChange: end');
};
