import {
  Hover,
  HoverParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import {
  drawGraph,
  findToken,
  findTokenInGraph,
  generateTokenTreeGraph,
  getThemeComparison,
  getTokensFromFile,
  getTokenSrcAndCategory,
  renderDependencyGraph,
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

  const t = findToken({ query, tokens });
  if (!t) return;

  // TODO get token information from some tree!!
  const graph = generateTokenTreeGraph(t, tokens);
  const { filepath } = await drawGraph(graph, settings.tokens.srcPackage);
  const token = findTokenInGraph(query.name, graph);

  if (!token) return;

  const content = [
    ["Type", token.type],
    ["Category", token.category],
    ["Theme", token.theme],
    ["Mode", token.mode],
    ["Platform", token.platform],
    ["Value", token.value],
    ["Source", `_${token.src}_`],
  ];
  const comparison = getThemeComparison(token, tokens);

  const contents = {
    kind: "markdown",
    value: [
      `#### 🎨 \`${query.name}\` (${token._tokenType})`,
      `---`,
      `\n`,
      `| ${content.map((c) => c[0]).join("\t | ")} |`,
      `|${content.map((c) => ":----------").join(" | ")}|`,
      `| ${content.map((c) => c[1]).join("\t | ")} |`,
      ``,
      `---`,
      ``,
      `| Theme | Value | Source |`,
      `|:----------|${
        ["color", "size"].includes(token.type) ? "----------:" : ":----------"
      }|:----------|`,
      comparison.content
        .map((c, i) => `| ${comparison.headers[i]} | ${c.value} | ${c.src} |`)
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
