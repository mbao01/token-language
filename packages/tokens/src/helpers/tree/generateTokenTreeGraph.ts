// TODO:: Use the HEIRARCHY TO GET THE RIGHT TOKENS HERE!!!

import type { TokenGraph, TokenNode } from "@/token";
import { hasMatchingTheme } from "../token/hasMatchingTheme";

/**
 * Formats a TokenNode into a TokenGraph structure.
 * This internal utility function transforms a token into the graph format
 * by creating a node with name and attributes properties.
 * 
 * @param {TokenNode} token - The token to format
 * @returns {Pick<TokenGraph, 'name' | 'attributes'>} Formatted token graph node
 */
const tokenToGraphNode = (token: TokenNode) => {
  return {
    name: token.name,
    attributes: {
      ...token,
    },
  };
};

/**
 * Finds a token that the given token depends on (references via originalValue).
 * This internal function searches for dependency relationships between tokens
 * by examining the originalValue property for token references.
 * 
 * @param {TokenNode} token - The token to find dependencies for
 * @param {TokenNode[]} tokens - Array of all available tokens
 * @returns {TokenNode | undefined} The dependency token if found
 */
const getTokenDependency = (token: TokenNode, tokens: TokenNode[]) => {
  return tokens.find(
    (t) => {
      // Ensure we don't match the token itself in case of circular references
      const isSameTokenReferenced = (
        t.originalValue?.toString() === `{!${token.name}}` &&
        t._tokenType === token._tokenType
      );

      const isTokenReferenced = token.originalValue.toString().includes(`{!${t.name}}`);

      return isTokenReferenced && !isSameTokenReferenced;
    }
  );
};

/**
 * Recursively generates a dependency graph showing what tokens a given token depends on.
 * This internal function builds a chain of dependencies by following originalValue references
 * up the dependency tree until it reaches a base token with no further dependencies.
 * 
 * @param {TokenNode | undefined} token - The current token in the dependency chain
 * @param {TokenNode[]} tokens - Array of all available tokens
 * @param {TokenGraph} currentGraph - The current graph being built
 * @returns {TokenGraph} Complete dependency graph from root dependency to current token
 */
const generateTokenDependencyGraph = (
  token: TokenNode | undefined,
  tokens: TokenNode[],
  currentGraph: TokenGraph
) => {
  if (!token) return currentGraph;

  const graph = { ...tokenToGraphNode(token), children: [currentGraph] };
  const dependency = getTokenDependency(token, tokens);

  return generateTokenDependencyGraph(dependency, tokens, graph);
};

/**
 * Recursively generates a graph of tokens that depend on the given token.
 * This internal function builds a tree showing all tokens that reference the current token,
 * creating a complete dependent graph for visualization and analysis.
 * 
 * @param {TokenNode} token - The token to find dependents for
 * @param {TokenNode[]} tokens - Array of all available tokens
 * @returns {TokenGraph} Graph showing the token and all its dependents
 */
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

    return t.originalValue?.toString().includes(`{!${token.name}}`) && hasMatchingTheme(t, token);
  });

  return {
    ...tokenToGraphNode(token),
    ...(dependents.length > 0
      ? {
          children: dependents.map((t) =>
            generateTokenDependentGraph(t, tokens)
          ),
        }
      : {}),
  };
};

/**
 * Generates a complete token dependency tree graph showing both dependencies and dependents.
 * This function creates a comprehensive graph that shows what a token depends on (up the chain)
 * and what depends on it (down the chain), providing a complete picture of token relationships.
 * The resulting graph can be used for visualization, impact analysis, and dependency management.
 * 
 * @param {TokenNode} token - The root token to generate the tree graph for
 * @param {TokenNode[]} tokens - Array of all available tokens to analyze relationships
 * @returns {TokenGraph} Complete tree graph with dependencies above and dependents below the root token
 * 
 * @example
 * ```typescript
 * const baseColorToken = {
 *   name: "COLOR_BLUE_500",
 *   _tokenType: "token",
 *   value: "#3b82f6",
 *   originalValue: "#3b82f6",
 *   theme: "light",
 *   // ... other properties
 * };
 * 
 * const aliasToken = {
 *   name: "COLOR_PRIMARY", 
 *   _tokenType: "alias",
 *   originalValue: "{!COLOR_BLUE_500}",
 *   theme: "light",
 *   // ... other properties
 * };
 * 
 * const componentToken = {
 *   name: "BUTTON_BACKGROUND",
 *   _tokenType: "alias", 
 *   originalValue: "{!COLOR_PRIMARY}",
 *   theme: "light",
 *   // ... other properties
 * };
 * 
 * const allTokens = [baseColorToken, aliasToken, componentToken];
 * 
 * // Generate tree for the alias token
 * const treeGraph = generateTokenTreeGraph(aliasToken, allTokens);
 * console.log(treeGraph);
 * // Returns a graph like:
 * // {
 * //   name: "COLOR_BLUE_500",  // Root dependency
 * //   attributes: { baseColorToken },
 * //   children: [{
 * //     name: "COLOR_PRIMARY",  // The target token
 * //     attributes: { aliasToken },
 * //     children: [{
 * //       name: "BUTTON_BACKGROUND",  // Dependent
 * //       attributes: { componentToken }
 * //     }]
 * //   }]
 * // }
 * 
 * // Usage for impact analysis
 * const impactGraph = generateTokenTreeGraph(primaryColorToken, allTokens);
 * const countDependents = (graph) => {
 *   return (graph.children?.length || 0) + 
 *          (graph.children?.reduce((sum, child) => sum + countDependents(child), 0) || 0);
 * };
 * console.log(`Changing this token affects ${countDependents(impactGraph)} other tokens`);
 * 
 * // Usage for visualization
 * const visualizationData = generateTokenTreeGraph(token, tokens);
 * renderTokenTree(visualizationData);
 * ```
 */
export const generateTokenTreeGraph = (
  token: TokenNode,
  tokens: TokenNode[]
) => {
  const tokenDependentsGraph = generateTokenDependentGraph(token, tokens);
  const dependency = getTokenDependency(token, tokens);
  const tokenTree = generateTokenDependencyGraph(
    dependency,
    tokens,
    tokenDependentsGraph
  );

  return tokenTree;
};
