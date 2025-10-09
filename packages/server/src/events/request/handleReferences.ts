import fs from "fs";
import path from "path";
import fg from "fast-glob";
import {
  Location,
  Position,
  Range,
  ReferenceParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { URI } from "vscode-uri";
import { getTokenSrcAndCategory } from "tokens-utilities/helpers";
import { getTokenAtPosition } from "../../helpers/token";
import { getGlobalSettings } from "../../helpers/getDocumentSettings";
import { documents } from "../../server/documents";

const walkFiles = async (dir: string, callback: (path: string) => void) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkFiles(full, callback);
    else callback(full);
  }
};

export const handleReferences: ServerRequestHandler<
  ReferenceParams,
  Location[] | undefined | null,
  Location[],
  void
> = async (params) => {
  const { textDocument, position, context } = params;
  const doc = documents.get(textDocument.uri);
  if (!doc) return [];

  const settings = getGlobalSettings();
  if (!settings.tokens.srcPackage) return [];

  const { absoluteSrc, category } = getTokenSrcAndCategory(textDocument.uri);

  const { token: name } = getTokenAtPosition(doc, position);
  if (!(name && absoluteSrc && category)) return [];

  const locations: Location[] = [];
  const folderPath = path.join(settings.tokens.srcPackage, "src");
  const files = await fg(`**/*.json`, {
    cwd: folderPath,
    ignore: ["**/node_modules/**", "**/package.json", settings.tokens.json],
  });

  for (const relativePath of files) {
    const filePath = path.join(folderPath, relativePath);
    const content = fs.readFileSync(filePath, "utf-8");
    let idx = content.indexOf(name);
    while (idx !== -1) {
      const before = content.slice(0, idx);
      const line = before.split("\n").length - 1;
      const char = idx - before.lastIndexOf("\n") - 1;
      locations.push(
        Location.create(
          URI.file(filePath).toString(),
          Range.create(
            Position.create(line, char),
            Position.create(line, char + name.length)
          )
        )
      );
      idx = content.indexOf(name, idx + 1);
    }
  }

  return locations;
};
