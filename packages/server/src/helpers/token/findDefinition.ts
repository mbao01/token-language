import fs from "fs";
import path from "path";
import fg from "fast-glob";
import { URI } from "vscode-uri";
import { TokenLanguageSettings } from "../types";
import { HIERARCHY } from "./hierarchy";

export const findDefinition = async (
  token: any,
  {
    query,
    isDefinition,
    absoluteSrc,
  }: {
    query: string;
    isDefinition: boolean | undefined;
    absoluteSrc: string;
  },
  settings: TokenLanguageSettings
) => {
  type Definition = {
    relativePath: string;
    line: number;
    uri: string;
    range: { start: number; end: number };
  };
  const definition: Definition[] = [];
  const folderPath = path.join(settings.tokens.srcPackage, "src");
  const files = await fg(`**/*.json`, {
    cwd: folderPath,
    ignore: ["**/node_modules/**", "**/package.json", settings.tokens.json],
  });

  const newName = `"${query}"`;

  for (const relativePath of files) {
    const filePath = path.join(folderPath, relativePath);
    const content = fs.readFileSync(filePath, "utf-8");
    let idx = content.indexOf(newName);
    while (idx !== -1) {
      const before = content.slice(0, idx);
      const line = before.split("\n").length - 1;
      const char = idx - before.lastIndexOf("\n") - 1;
      definition.push({
        relativePath,
        line,
        uri: URI.file(filePath).toString(),
        range: { start: char + 1, end: char + newName.length - 1 },
      });
      idx = content.indexOf(newName, idx + 1);
    }
  }
  if (!isDefinition) {
    if (definition.length <= 1) return { definition };

    const keys = absoluteSrc.includes("all-platforms")
      ? [
          [token.buildName.replace("-", "_")],
          [
            token.buildName.replace("-", "_"),
            token.theme === "default" ? undefined : token.theme,
          ],
        ]
      : [
          [
            token.platform,
            token.buildName.replace("-", "_"),
            token.theme === "default" ? undefined : token.theme,
            token.mode,
          ],
        ];

    const expectations = Object.entries(HIERARCHY)
      .filter(([k, v]) =>
        keys.some((key) =>
          k.includes(key.filter(Boolean).join("_").toUpperCase())
        )
      )
      ?.map(([, v]) => v);

    const seen = new Set();
    const filteredDefinitions: Definition[] = [];

    expectations?.forEach((expectation) => {
      expectation = expectation.reverse().filter(Boolean);
      const index = expectation.findIndex((e) => e.includes(token.src));
      expectation = expectation.slice(index);

      definition.forEach((d, i) => {
        if (
          !seen.has(i) &&
          expectation.some((e) => `src/${d.relativePath}`.startsWith(e))
        ) {
          filteredDefinitions.push(d);
          seen.add(i);
        }
      });
    });

    const goToDefinition = filteredDefinitions.reverse().slice(0, 1);

    return {
      definition: goToDefinition,
    };
  }

  return { definition };
};
