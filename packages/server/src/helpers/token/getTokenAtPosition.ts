import { Position, Range } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { TOKEN_DEFINITION_REGEX, TOKEN_VALUE_REGEX } from "tokens-utilities/constants";

const findTokenMatch = ({
  line,
  regex,
  position,
}: {
  line: string;
  regex: RegExp;
  position: Position;
}) => {
  let matchDefinition: RegExpExecArray | null;
  while ((matchDefinition = regex.exec(line)) !== null) {
    const start = matchDefinition.index;
    const end = start + matchDefinition[0].length;

    if (position.character >= start && position.character <= end) {
      const range = {
        start: { line: position.line, character: start },
        end: { line: position.line, character: end },
      };
      return {
        range,
        token: matchDefinition[1],
      };
    }
  }
};

export const getTokenAtPosition = (
  doc: TextDocument,
  position: Position
): { range?: Range; token: string | null; isDefinition?: boolean } => {
  const line = doc.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line + 1, character: 0 },
  });


  let result = findTokenMatch({
    line,
    regex: TOKEN_DEFINITION_REGEX,
    position,
  });

  if (result) {
    return { ...result, isDefinition: true };
  }

  result = findTokenMatch({
    line,
    regex: TOKEN_VALUE_REGEX,
    position,
  });

  if (result) {
    return { ...result, isDefinition: false };
  }

  return { token: null };
};
