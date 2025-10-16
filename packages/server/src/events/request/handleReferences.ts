import {
  Location,
  Position,
  Range,
  ReferenceParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { parseTokenFilePath } from "tokens-utilities/helpers";
import { findReferences, getTokenAtPosition } from "../../helpers/token";
import { getGlobalSettings } from "../../helpers/getDocumentSettings";
import { documents } from "../../server/documents";

export const handleReferences: ServerRequestHandler<
  ReferenceParams,
  Location[] | undefined | null,
  Location[],
  void
> = async (params) => {
  const { textDocument, position } = params;
  const doc = documents.get(textDocument.uri);
  if (!doc) return [];

  const settings = getGlobalSettings();
  if (!settings.tokens.srcPackage) return [];

  const { absoluteSrc, category } = parseTokenFilePath(textDocument.uri);

  const { token: name } = getTokenAtPosition(doc, position);
  if (!(name && absoluteSrc && category)) return [];

  const { references } = await findReferences(name, settings);

  const locations = references.map(({ uri, line, range }) =>
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
