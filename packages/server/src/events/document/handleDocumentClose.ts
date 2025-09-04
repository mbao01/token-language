import { TextDocument } from "vscode-languageserver-textdocument";
import { deleteDocumentSettings } from "../../helpers/getDocumentSettings";
import { TextDocumentChangeEvent } from "vscode-languageserver/node";

export const handleDocumentClose = (
  event: TextDocumentChangeEvent<TextDocument>
) => {
  // Only keep settings for open documents
  deleteDocumentSettings(event.document.uri);
};
