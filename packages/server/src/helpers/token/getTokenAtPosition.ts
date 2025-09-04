import { Position } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

export const getTokenAtPosition = (
  doc: TextDocument,
  position: Position
): string | null => {
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
};
