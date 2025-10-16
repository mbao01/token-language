import type { TokenGraph, TokenNode } from "@/token";

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
