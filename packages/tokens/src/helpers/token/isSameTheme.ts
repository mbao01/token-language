import { TokenNode } from "@/token";

/**
 * Determines if two tokens belong to exactly the same theme configuration.
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
 * console.log(isSameTheme(lightWebToken, darkWebToken)); // false - different mode
 * console.log(isSameTheme(lightWebToken, lightIosToken)); // false - different platform
 * console.log(isSameTheme(lightWebToken, exactMatch)); // true - all properties match
 * 
 * // Usage in filtering tokens by theme
 * const sameThemeTokens = allTokens.filter(token => 
 *   isSameTheme(referenceToken, token)
 * );
 * 
 * // Usage in token dependency resolution
 * const compatibleDependencies = dependencies.filter(dep => 
 *   isSameTheme(parentToken, dep)
 * );
 * ```
 */
export const isSameTheme = (a: TokenNode, b: TokenNode) => {
  return (
    a.buildName === b.buildName &&
    a.theme === b.theme &&
    a.mode === b.mode &&
    a.platform === b.platform
  );
};
