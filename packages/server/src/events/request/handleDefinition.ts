import {
  Definition,
  DefinitionLink,
  DefinitionParams,
  Location,
  Range,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { documents } from "../../server/documents";
import { getTokenAtPosition } from "../../helpers/token";

interface TokenLocation {
  uri: string;
  range: Range;
}

const tokenIndex: Record<string, TokenLocation> = {};

export const handleDefinition: ServerRequestHandler<
  DefinitionParams,
  Definition | DefinitionLink[] | undefined | null,
  Location[] | DefinitionLink[],
  void
> = (params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;

  const word = getTokenAtPosition(doc, params.position);
  if (!word) return null;

  // If the word is a token, return its "definition location"
  const tokenFile = tokenIndex[word];
  if (!tokenFile) return null;

  return {
    uri: tokenFile.uri, // e.g. file://.../tokens/colors.json
    range: tokenFile.range, // position inside that file where the token is defined
  };
};
