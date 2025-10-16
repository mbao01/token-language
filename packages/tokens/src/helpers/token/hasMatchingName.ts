import { TokenNode } from "@/token";

/**
 * Determines if two tokens have matching names.
 * This function performs a simple string comparison of token names to check for equality.
 * 
 * @param {TokenNode} a - The first token to compare
 * @param {TokenNode} b - The second token to compare
 * @returns {boolean} True if both tokens have the same name, false otherwise
 * 
 * @example
 * ```typescript
 * const token1 = { name: "COLOR_PRIMARY", theme: "light", ... };
 * const token2 = { name: "COLOR_PRIMARY", theme: "dark", ... };
 * const token3 = { name: "COLOR_SECONDARY", theme: "light", ... };
 * 
 * console.log(hasMatchingName(token1, token2)); // true - same name
 * console.log(hasMatchingName(token1, token3)); // false - different names
 * 
 * // Usage in filtering tokens by name
 * const sameNameTokens = allTokens.filter(token => 
 *   hasMatchingName(referenceToken, token)
 * );
 * 
 * // Usage in token comparison operations
 * const variations = tokens.filter(t => 
 *   hasMatchingName(baseToken, t) && t.theme !== baseToken.theme
 * );
 * ```
 */
export const hasMatchingName = (a: TokenNode, b: TokenNode) => {
  return a.name === b.name;
};
