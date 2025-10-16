import type { TokenGraph, TokenNode } from "@/token";

/**
 * Recursively searches for a token by name within a token dependency graph.
 * This function performs a depth-first search through the token graph structure
 * to locate a specific token by its name, returning the actual TokenNode data.
 * 
 * @param {string} name - The name of the token to search for
 * @param {TokenGraph} graph - The token graph to search within
 * @returns {TokenNode | null} The found token's attributes if located, null otherwise
 * 
 * @example
 * ```typescript
 * // Example token graph structure
 * const tokenGraph = {
 *   name: "COLOR_PRIMARY",
 *   attributes: {
 *     name: "COLOR_PRIMARY",
 *     value: "#007bff",
 *     _tokenType: "token",
 *     // ... other TokenNode properties
 *   },
 *   children: [
 *     {
 *       name: "BUTTON_COLOR",
 *       attributes: {
 *         name: "BUTTON_COLOR", 
 *         originalValue: "{!COLOR_PRIMARY}",
 *         _tokenType: "alias",
 *         // ... other properties
 *       },
 *       children: [
 *         {
 *           name: "PRIMARY_BUTTON_BG",
 *           attributes: {
 *             name: "PRIMARY_BUTTON_BG",
 *             originalValue: "{!BUTTON_COLOR}",
 *             _tokenType: "alias",
 *             // ... other properties
 *           }
 *         }
 *       ]
 *     }
 *   ]
 * };
 * 
 * // Find a token at the root level
 * const primaryColor = findTokenInGraph("COLOR_PRIMARY", tokenGraph);
 * console.log(primaryColor?.value); // "#007bff"
 * 
 * // Find a nested token
 * const buttonColor = findTokenInGraph("BUTTON_COLOR", tokenGraph);
 * console.log(buttonColor?.originalValue); // "{!COLOR_PRIMARY}"
 * 
 * // Find a deeply nested token
 * const buttonBg = findTokenInGraph("PRIMARY_BUTTON_BG", tokenGraph);
 * console.log(buttonBg?.originalValue); // "{!BUTTON_COLOR}"
 * 
 * // Token not found
 * const notFound = findTokenInGraph("NONEXISTENT_TOKEN", tokenGraph);
 * console.log(notFound); // null
 * 
 * // Usage in dependency analysis
 * const dependentTokens = [];
 * graph.children?.forEach(child => {
 *   const token = findTokenInGraph(child.name, tokenGraph);
 *   if (token && token._tokenType === "alias") {
 *     dependentTokens.push(token);
 *   }
 * });
 * ```
 */
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
