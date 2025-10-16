import { TokenNode } from "@/token";

/**
 * Determines if two tokens have exactly matching theme configurations.
 * This function performs a comprehensive comparison of all theme-related properties
 * including build name, theme, mode, and platform to ensure complete theme compatibility.
 * 
 * @param {TokenNode} a - The first token to compare
 * @param {TokenNode} b - The second token to compare
 * @returns {boolean} True if both tokens have identical theme configuration, false otherwise
 * 
 * @example
 * ```typescript
 * const lightWebToken = {
 *   buildName: "acme-us",
 *   theme: "brand",
 *   mode: "light",
 *   platform: "web",
 *   // ... other properties
 * };
 * 
 * const darkWebToken = {
 *   buildName: "acme-us",
 *   theme: "brand", 
 *   mode: "dark", // Different mode
 *   platform: "web",
 *   // ... other properties
 * };
 * 
 * const lightIosToken = {
 *   buildName: "acme-us",
 *   theme: "brand",
 *   mode: "light",
 *   platform: "ios", // Different platform
 *   // ... other properties
 * };
 * 
 * const exactMatch = {
 *   buildName: "acme-us",
 *   theme: "brand",
 *   mode: "light", 
 *   platform: "web",
 *   // ... other properties
 * };
 * 
 * console.log(hasMatchingTheme(lightWebToken, darkWebToken)); // false - different mode
 * console.log(hasMatchingTheme(lightWebToken, lightIosToken)); // false - different platform
 * console.log(hasMatchingTheme(lightWebToken, exactMatch)); // true - all properties match
 * 
 * // Usage in filtering tokens by theme
 * const sameThemeTokens = allTokens.filter(token => 
 *   hasMatchingTheme(referenceToken, token)
 * );
 * 
 * // Usage in token dependency resolution
 * const compatibleDependencies = dependencies.filter(dep => 
 *   hasMatchingTheme(parentToken, dep)
 * );
 * ```
 */
export const hasMatchingTheme = (a: TokenNode, b: TokenNode) => {
  return (
    a.buildName === b.buildName &&
    a.theme === b.theme &&
    a.mode === b.mode &&
    a.platform === b.platform
  );
};
