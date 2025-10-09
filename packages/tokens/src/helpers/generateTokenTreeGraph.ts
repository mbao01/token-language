// TODO:: Use the HEIRARCHY TO GET THE RIGHT TOKENS HERE!!!

import type { TokenGraph, TokenNode } from "@/token";
import { isSameTheme } from "./isSameTheme";

const formatToken = (token: TokenNode) => {
  return {
    name: token.name,
    attributes: {
      ...token,
    },
  };
};

const getToken = (token: TokenNode, tokens: TokenNode[]) => {
  return tokens.find(
    (t) =>
      token.originalValue.toString().includes(`{!${t.name}}`) &&
      !(
        t.originalValue.toString() === `{!${token.name}}` &&
        t._tokenType === token._tokenType
      )
  );
};

const generateTokenDependencyGraph = (
  token: TokenNode | undefined,
  tokens: TokenNode[],
  currentGraph: TokenGraph
) => {
  if (!token) return currentGraph;

  const graph = { ...formatToken(token), children: [currentGraph] };
  const dependency = getToken(token, tokens);

  return generateTokenDependencyGraph(dependency, tokens, graph);
};

const generateTokenDependentGraph = (
  token: TokenNode,
  tokens: TokenNode[]
): TokenGraph => {
  const isTokenMappedToAliasWithSameName =
    token._tokenType === "token" &&
    tokens.findIndex(
      (t) => t._tokenType === "alias" && token.originalValue === `{!${t.name}}`
    ) > 0;

  const dependents = tokens.filter((t) => {
    // a token cannot be used as an alias
    if (token._tokenType === "token" && t._tokenType === "alias") return false;

    // if a token and an alias have the same name, assume any dependencies are mapped to the alias and not the token
    if (isTokenMappedToAliasWithSameName) return false;

    return t.originalValue.toString().includes(`{!${token.name}}`) && isSameTheme(t, token);
  });

  return {
    ...formatToken(token),
    ...(dependents.length > 0
      ? {
          children: dependents.map((t) =>
            generateTokenDependentGraph(t, tokens)
          ),
        }
      : {}),
  };
};

export const generateTokenTreeGraph = (
  token: TokenNode,
  tokens: TokenNode[]
) => {
  const tokenDependentsGraph = generateTokenDependentGraph(token, tokens);
  const dependency = getToken(token, tokens);
  const tokenTree = generateTokenDependencyGraph(
    dependency,
    tokens,
    tokenDependentsGraph
  );

  return tokenTree;
};

export const findTokenInGraph = (
  name: TokenNode["name"],
  graph: TokenGraph
): TokenNode | null => {
  if (graph.name === name) {
    return graph.attributes;
  }

  for (let g of graph.children ?? []) {
    const node = findTokenInGraph(name, g);
    if (node) {
      return node;
    }
  }

  return null;
};
