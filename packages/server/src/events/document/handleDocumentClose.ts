import { TextDocument } from "vscode-languageserver-textdocument";
import { deleteDocumentSettings } from "../../helpers/getDocumentSettings";
import { TextDocumentChangeEvent } from "vscode-languageserver/node";
import { connection } from "../../server/connection";

export const handleDocumentClose = (
  event: TextDocumentChangeEvent<TextDocument>
) => {
  connection.console.log('🔒 Document Closed: handleDocumentClose: start');
  // Only keep settings for open documents
  deleteDocumentSettings(event.document.uri);
  connection.console.log('🔒 Document Closed: handleDocumentClose: end');
};
