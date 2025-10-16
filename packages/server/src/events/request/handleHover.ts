import {
  Hover,
  HoverParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import {
  drawGraph,
  getClosestToken,
  findTokenInGraph,
  generateTokenTreeGraph,
  getAllTokenThemes,
  getTokensFromFile,
  getTokenSrcAndCategory,
} from "tokens-utilities/helpers";
import { getTokenAtPosition } from "../../helpers/token";
import { getGlobalSettings } from "../../helpers/getDocumentSettings";
import { documents } from "../../server/documents";

export const handleHover: ServerRequestHandler<
  HoverParams,
  Hover | undefined | null,
  never,
  void
> = async (params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return;

  const { absoluteSrc, category } = getTokenSrcAndCategory(
    params.textDocument.uri
  );

  const {
    token: name,
    range,
    isDefinition,
  } = getTokenAtPosition(doc, params.position);
  if (!(name && absoluteSrc && category)) return;

  const query = {
    name,
    src: absoluteSrc,
    category,
    isDefinition,
  };

  const settings = getGlobalSettings();
  if (!settings) return;

  const tokens = getTokensFromFile(settings.tokens.json);
  if (!tokens) return;

  const t = getClosestToken({ query, tokens });
  if (!t) return;

  // TODO get token information from some tree!!
  const graph = generateTokenTreeGraph(t, tokens);
  const { filepath } = await drawGraph(graph, settings.tokens.srcPackage);
  const token = findTokenInGraph(query.name, graph);

  if (!token) return;

  const content = tokens.filter(
    (_t) =>
      _t.src === token.src &&
      _t.name === token.name &&
      _t.mode === token.mode &&
      _t.theme === token.theme &&
      _t.category === token.category
  );

  const headers = [
    { label: "Platform", key: "platform" },
    { label: "Type", key: "type" },
    { label: "Category", key: "category" },
    { label: "Theme", key: "buildTheme" },
    { label: "Mode", key: "mode" },
    { label: "Value", key: "value" },
    { label: "Source", key: "src" },
  ];
  const comparison = getAllTokenThemes(token, tokens);

  const contents = {
    kind: "markdown",
    value: [
      `#### 🎨 \`${query.name}\` (${token._tokenType})`,
      `---`,
      `\n`,
      `| ${headers.map(({ label }) => label).join("\t | ")} |`,
      `|${headers.map(() => ":----------").join(" | ")}|`,
      content
        .map((row) => `| ${headers.map(({ key }) => row[key]).join(" | ")} | `)
        .join("\n"),
      ``,
      `---`,
      ``,
      `| ${comparison.headers.join(" | ")} |`,
      `|${comparison.headers.map(() => ":----------").join("|")}|`,
      comparison.content
        .map(
          (row) =>
            `| ${comparison.headers
              .map((header) => row[header]?.value ?? row[header] ?? "-")
              .join(" | ")} |`
        )
        .join("\n"),
      ``,
      `---`,
      `[📘 Token explorer](https://code.visualstudio.com/api) [view image](${filepath})`,
      ``,
      `![${graph.name}](${filepath})`,
      ``,
    ].join("\n"),
  } as const;

  return {
    range,
    contents,
  };
};
