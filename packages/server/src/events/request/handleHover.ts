import {
  Hover,
  HoverParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import {
  generateTokenVisualization,
  findMatchingToken,
  searchTokenInGraph,
  generateTokenTreeGraph,
  generateTokenThemeComparison,
  loadTokensFromFile,
  parseTokenFilePath,
  getColorMarkdown,
  Markdown,
  getTokenExplorerLink,
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

  const { absoluteSrc, category } = parseTokenFilePath(params.textDocument.uri);

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

  const tokens = loadTokensFromFile(settings.tokens.json);
  if (!tokens) return;

  const t = findMatchingToken({ query, tokens });
  if (!t) return;

  // TODO get token information from some tree!!
  const graph = generateTokenTreeGraph(t, tokens);
  const { filepath } = await generateTokenVisualization(
    graph,
    settings.tokens.srcPackage
  );
  const token = searchTokenInGraph(query.name, graph);

  if (!token) return;

  // only show tokens with the same name, category, mode, theme and buildName
  const content = tokens
    .filter(
      (_t) =>
        _t.name === token.name &&
        _t.mode === token.mode &&
        _t.theme === token.theme &&
        _t.buildName === token.buildName &&
        _t.category === token.category
    )
    .map((t) => ({
      ...t,
      value: getColorMarkdown(t.value),
    }))
    .sort((a, b) => a.platform.localeCompare(b.platform));

  const headers = [
    { label: "Platform", key: "platform" },
    { label: "Type", key: "type" },
    { label: "Category", key: "category" },
    { label: "Theme", key: "buildName" },
    { label: "Mode", key: "mode" },
    { label: "Value", key: "value" },
    { label: "Source", key: "src" },
  ];
  const comparison = generateTokenThemeComparison(token, tokens);

  const markdown = new Markdown();
  markdown.header(`🎨 \`${query.name}\` (${token._tokenType})`, 4);
  markdown.divider();
  markdown.break();
  markdown.table(headers, content);
  markdown.divider();
  markdown.break();
  markdown.header(`📊 Theme comparison across platforms`, 4);
  markdown.table(comparison.headers, comparison.content);
  markdown.divider();
  markdown.next(
    `[📘 View token in the explorer](${getTokenExplorerLink(token)})`
  );
  markdown.next(`![${graph.name}](${filepath})`);

  const contents = {
    kind: "markdown",
    value: markdown.toString(),
  } as const;

  return {
    range,
    contents,
  };
};
