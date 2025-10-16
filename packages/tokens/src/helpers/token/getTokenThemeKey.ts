import { TokenNode } from "@/token";

/**
 * Generates a unique theme key for a token based on its build name, theme, and mode.
 * This function creates a composite identifier that can be used to group or identify
 * tokens that belong to the same theme configuration.
 * 
 * @param {TokenNode} token - The token to generate a theme key for
 * @returns {string} A unique theme key in the format "buildName-theme-mode"
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
 * const themeKey = getTokenThemeKey(token);
 * console.log(themeKey); // "acme-us-brand-light"
 * 
 * // Use theme keys to group tokens
 * const tokensByTheme = {};
 * tokens.forEach(token => {
 *   const key = getTokenThemeKey(token);
 *   if (!tokensByTheme[key]) {
 *     tokensByTheme[key] = [];
 *   }
 *   tokensByTheme[key].push(token);
 * });
 * 
 * // Example with default theme
 * const defaultToken = {
 *   buildName: "default",
 *   theme: "default", 
 *   mode: "dark",
 *   // ...
 * };
 * console.log(getTokenThemeKey(defaultToken)); // "default-default-dark"
 * ```
 */
export const getTokenThemeKey = (token: TokenNode) => {
  return `${token.buildName}-${token.theme}-${token.mode}`;
};
