import { type TokenNode } from "@/token";

/**
 * Generates a unique identifier string for a token based on its key properties.
 * This function creates a filesystem-safe, lowercase identifier that uniquely identifies
 * a token by combining its name, build name, theme, token type, and source path.
 * 
 * @param {TokenNode} token - The token to generate a unique identifier for
 * @returns {string} A unique identifier string with forward slashes replaced by underscores and converted to lowercase
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
 * const identifier = getTokenUniqueIdentifier(token);
 * console.log(identifier); // "color_primary+acme-us+brand+token+colors_primary"
 * 
 * // Use for creating unique file paths or cache keys
 * const cacheKey = `token_cache_${getTokenUniqueIdentifier(token)}`;
 * 
 * // Use for generating unique filenames
 * const filename = `${getTokenUniqueIdentifier(token)}.json`;
 * 
 * // Example with alias token
 * const aliasToken = {
 *   name: "BUTTON_COLOR",
 *   buildName: "default",
 *   theme: "light",
 *   _tokenType: "alias",
 *   src: "components/button",
 * };
 * console.log(getTokenUniqueIdentifier(aliasToken)); 
 * // "button_color+default+light+alias+components_button"
 * ```
 */
export const getTokenUniqueIdentifier = (token: TokenNode) => {
  return `${token.name}+${token.buildName}+${token.theme}+${token._tokenType}+${token.src}`
    .replaceAll("/", "_")
    .toLowerCase();
};
