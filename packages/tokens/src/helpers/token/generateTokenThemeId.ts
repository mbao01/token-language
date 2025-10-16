import { TokenNode } from "@/token";

/**
 * Generates a unique theme identifier for a token based on its build name, theme, and mode.
 * This function creates a composite identifier that can be used to group or identify
 * tokens that belong to the same theme configuration.
 * 
 * @param {TokenNode} token - The token to generate a theme identifier for
 * @returns {string} A unique theme identifier in the format "buildName-theme-mode"
 * 
 * @example
 * ```typescript
 * const token = {
 *   name: "COLOR_PRIMARY",
 *   buildName: "acme-us",
 *   theme: "brand",
 *   mode: "light",
 *   // ... other properties
 * };
 * 
 * const themeId = generateTokenThemeId(token);
 * console.log(themeId); // "acme-us-brand-light"
 * 
 * // Use theme IDs to group tokens
 * const tokensByTheme = {};
 * tokens.forEach(token => {
 *   const id = generateTokenThemeId(token);
 *   if (!tokensByTheme[id]) {
 *     tokensByTheme[id] = [];
 *   }
 *   tokensByTheme[id].push(token);
 * });
 * 
 * // Example with default theme
 * const defaultToken = {
 *   buildName: "default",
 *   theme: "default", 
 *   mode: "dark",
 *   // ...
 * };
 * console.log(generateTokenThemeId(defaultToken)); // "default-default-dark"
 * ```
 */
export const generateTokenThemeId = (token: TokenNode) => {
  return `${token.buildName}-${token.theme}-${token.mode}`;
};
