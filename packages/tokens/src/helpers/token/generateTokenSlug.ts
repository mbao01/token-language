import { type TokenNode } from "@/token";

/**
 * Generates a filesystem-safe slug for a token based on its key properties.
 * This function creates a unique, lowercase slug that identifies a token by combining
 * its name, build name, theme, token type, and source path with safe characters.
 * 
 * @param {TokenNode} token - The token to generate a slug for
 * @returns {string} A unique slug string with forward slashes replaced by underscores and converted to lowercase
 * 
 * @example
 * ```typescript
 * const token = {
 *   name: "COLOR_PRIMARY",
 *   buildName: "acme-us",
 *   theme: "brand",
 *   _tokenType: "token",
 *   src: "colors/primary",
 *   // ... other properties
 * };
 * 
 * const slug = generateTokenSlug(token);
 * console.log(slug); // "color_primary+acme-us+brand+token+colors_primary"
 * 
 * // Use for creating unique file paths or cache keys
 * const cacheKey = `token_cache_${generateTokenSlug(token)}`;
 * 
 * // Use for generating unique filenames
 * const filename = `${generateTokenSlug(token)}.json`;
 * 
 * // Example with alias token
 * const aliasToken = {
 *   name: "BUTTON_COLOR",
 *   buildName: "default",
 *   theme: "light",
 *   _tokenType: "alias",
 *   src: "components/button",
 * };
 * console.log(generateTokenSlug(aliasToken)); 
 * // "button_color+default+light+alias+components_button"
 * ```
 */
export const generateTokenSlug = (token: TokenNode) => {
  return `${token.name}+${token.buildName}+${token.theme}+${token._tokenType}+${token.src}`
    .replaceAll("/", "_")
    .toLowerCase();
};
