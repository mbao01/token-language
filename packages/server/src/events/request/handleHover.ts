import {
  Hover,
  HoverParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { documents } from "../../server/documents";
import { getTokenAtPosition } from "../../helpers/token";
import {
  findToken,
  findTokenInGraph,
  generateTokenTreeGraph,
  getTokenSrcAndCategory,
  renderDependencyGraph,
} from "tokens-utilities/helpers";
import { tokens } from "./c";

export const handleHover: ServerRequestHandler<
  HoverParams,
  Hover | undefined | null,
  never,
  void
> = (params) => {
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

  // const tokens: any[] = [];
  const t = findToken({ query, tokens: tokens as any[] });

  if (!t) return;

  // TODO get token information from some tree!!
  const graph = generateTokenTreeGraph(t, tokens as any[]);
  const renderedGraph = renderDependencyGraph("Dependency Graph", graph);
  const token = findTokenInGraph(query.name, graph);

  if (!token) return;

  const content = [
    { label: "Type", value: token._tokenType },
    { label: "Domain", value: token.domain },
    { label: "Build name", value: token.buildName },
    { label: "Theme", value: token.theme },
    { label: "Mode", value: token.mode },
    { label: "Platform", value: token.platform },
    { label: "Value", value: token.value },
    { label: "Source", value: `_${token.src}_` },
  ];

  const contents = {
    kind: "markdown",
    value: [
      `#### 🎨 \`${query.name}\``,
      `\n`,
      `| Property | Value |`,
      `|:----------|----------:|`,
      ...content.map(({ label, value }) => `| ${[label, value].join(" | ")} |`),
      ``,
      `---`,
      renderedGraph,
      `[📘 Token explorer](https://code.visualstudio.com/api)`,
      ``,
      `......................................................................................`,
    ].join("\n"),
  } as const;

  return {
    range,
    contents,
  };
};
