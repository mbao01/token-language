import { TokenNode } from "@/token";

/**
 * Compares two tokens to determine if they have the same name.
 * This is a simple equality check utility function used for token comparison and filtering.
 * 
 * @param {TokenNode} a - The first token to compare
 * @param {TokenNode} b - The second token to compare  
 * @returns {boolean} True if both tokens have the same name, false otherwise
 * 
 * @example
 * ```typescript
 * const token1 = {
 *   name: "COLOR_PRIMARY",
 *   theme: "light",
 *   platform: "web",
 *   // ... other properties
 * };
 * 
 * const token2 = {
 *   name: "COLOR_PRIMARY", 
 *   theme: "dark",
 *   platform: "ios",
 *   // ... other properties
 * };
 * 
 * const token3 = {
 *   name: "COLOR_SECONDARY",
 *   // ... other properties
 * };
 * 
 * console.log(isSameName(token1, token2)); // true - same name despite different theme/platform
 * console.log(isSameName(token1, token3)); // false - different names
 * 
 * // Usage in filtering tokens with the same name
 * const primaryTokens = allTokens.filter(token => 
 *   isSameName(token, referenceToken)
 * );
 * 
 * // Usage in finding token variations
 * const variations = tokens.filter(t => 
 *   isSameName(t, baseToken) && t.theme !== baseToken.theme
 * );
 * ```
 */
export const isSameName = (a: TokenNode, b: TokenNode) => {
  return a.name === b.name;
};
