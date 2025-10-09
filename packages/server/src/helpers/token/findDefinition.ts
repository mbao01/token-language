import fs from "fs";
import path from "path";
import fg from "fast-glob";
import { URI } from "vscode-uri";
import { TokenLanguageSettings } from "../types";

export const findDefinition = async (
  token: any,
  {
    isDefinition,
    absoluteSrc,
  }: {
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

  const newName = `"${token.name}"`;

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

    // const onlyDefault = (d: Definition) =>
    //   d.relativePath.startsWith(token.src) ||
    //   d.relativePath.includes(["all-platforms", "all-orgs"].join("/"));
    // const specificOrg = (d: Definition) =>
    //   d.relativePath.includes(
    //     ["all-platforms", ...token.buildName.split("-")].join("/")
    //   );
    // const specificTheme = (d: Definition) =>
    //   d.relativePath.startsWith(token.src) ||
    //   d.relativePath.includes(
    //     ["all-platforms", ...token.buildName.split("-"), token.theme].join("/")
    //   );
    // const specificMode = (d: Definition) =>
    //   d.relativePath.startsWith(token.src) ||
    //   d.relativePath.includes(
    //     [
    //       "all-platforms",
    //       ...token.buildName.split("-"),
    //       token.theme,
    //       token.mode,
    //     ].join("/")
    //   );

    // if (token.platform === "all-platforms") {
    //   if (token.buildName === "default" && token.theme === "default") {
    //     return definition.filter(onlyDefault);
    //   }
    //   return definition.filter((d) => specificOrg(d) || onlyDefault(d));
    // }

    // // all-platforms/all-orgs/all-themes/all-modes

    // if (token.platform === "all-platforms") {
    // }

    // if (token.platform === "web") {
    //   return definition.filter(
    //     (d) =>
    //       d.relativePath.startsWith(token.src) ||
    //       d.relativePath.includes(
    //         `all-platforms/${token.buildName.replace("-", "/")}`
    //       )
    //   );
    // }

    // TODO::: Use build-config.csv as source of truth for inheritance??

    const key = [
      token.platform,
      token.buildName.replace("-", "_"),
      token.theme === "default" ? undefined : token.theme,
      token.mode,
    ]
      .filter(Boolean)
      .join("_")
      .toUpperCase();

    // TODO:: in the same source, we just choose it

    // TODO:: if it is a layer up, we choose it
    // dark -> all-modes
    // all-modes -> all-themes, bigbear -> all-themes
    // platform -> all-platform\
    // platform_buildname_theme||_mode

    return { definition };
  }

  return { definition };
};
