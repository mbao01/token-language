import {
  Definition,
  DefinitionLink,
  DefinitionParams,
  Location,
  Range,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { documents } from "../../server/documents";
import { connection } from "../../server/connection";
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
  connection.console.log("🔗 Definition Requested: handleDefinition: start");
  // here, show the hierarchy to the leaf node of the item whose definition is required.
  // here, show the value of the item for based on their location e.g nutmeg -> default -> light mode, nutmeg -> bigbear -> light mode
  // here show whether it uses a deprecated token in it's path or not
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;

  const { token: word } = getTokenAtPosition(doc, params.position);
  if (!word) return null;

  // If the word is a token, return its "definition location"
  const tokenFile = tokenIndex[word];
  if (!tokenFile) return null;

  return {
    uri: tokenFile.uri, // e.g. file://.../tokens/colors.json
    range: tokenFile.range, // position inside that file where the token is defined
  };
  connection.console.log("🔗 Definition Requested: handleDefinition: end");
};
