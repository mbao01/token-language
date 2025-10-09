import {
  Definition,
  DefinitionLink,
  DefinitionParams,
  Location,
  Position,
  Range,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { documents } from "../../server/documents";
import { connection } from "../../server/connection";
import { findDefinition, getTokenAtPosition } from "../../helpers/token";
import {
  findToken,
  getTokensFromFile,
  getTokenSrcAndCategory,
} from "tokens-utilities/helpers";
import { getGlobalSettings } from "../../helpers/getDocumentSettings";

export const handleDefinition: ServerRequestHandler<
  DefinitionParams,
  Definition | DefinitionLink[] | undefined | null,
  Location[] | DefinitionLink[],
  void
> = async (params) => {
  connection.console.log("🔗 Definition Requested: handleDefinition: start");
  // here, show the hierarchy to the leaf node of the item whose definition is required.
  // here, show the value of the item for based on their location e.g nutmeg -> default -> light mode, nutmeg -> bigbear -> light mode
  // here show whether it uses a deprecated token in it's path or not
  const { textDocument, position } = params;
  const doc = documents.get(textDocument.uri);
  if (!doc) return [];

  const settings = getGlobalSettings();
  if (!settings.tokens.srcPackage) return [];

  const { absoluteSrc, category } = getTokenSrcAndCategory(textDocument.uri);

  const { token: name, isDefinition } = getTokenAtPosition(doc, position);
  if (!(name && absoluteSrc && category)) return [];

  const query = {
    name,
    src: absoluteSrc,
    category,
    isDefinition,
  };

  const tokens = getTokensFromFile(settings.tokens.json);
  if (!tokens) return;

  const token = findToken({ query, tokens });
  if (!token) return;

  const { definition } = await findDefinition(
    token,
    { query: name, isDefinition, absoluteSrc },
    settings
  );

  const locations = definition.map(({ uri, line, range }) =>
    Location.create(
      uri,
      Range.create(
        Position.create(line, range.start),
        Position.create(line, range.end)
      )
    )
  );

  return locations;
};
