import fs from "fs";
import path from "path";
import fg from "fast-glob";
import { URI } from "vscode-uri";
import { TokenLanguageSettings } from "../types";

export const findReferences = async (
  name: string,
  settings: TokenLanguageSettings
) => {
  const references: {
    line: number;
    uri: string;
    range: { start: number; end: number };
  }[] = [];
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
      references.push({
        line,
        uri: URI.file(filePath).toString(),
        range: { start: char, end: char + name.length },
      });
      idx = content.indexOf(name, idx + 1);
    }
  }

  return { references };
};
