import path from "path";

/**
 * Extracts the category and absolute source path from a token file path.
 * This function parses a file path to determine the token's category (based on filename)
 * and the absolute source directory path, both normalized to lowercase.
 * 
 * @param {string} filePath - The full file path to the token file
 * @returns {Object} An object containing the extracted information
 * @returns {string} returns.category - The token category derived from the filename (without extension)
 * @returns {string} returns.absoluteSrc - The absolute directory path containing the token file
 * 
 * @example
 * ```typescript
 * // Extract category and source from file path
 * const result = getTokenSrcAndCategory('/project/tokens/colors/primary-colors.json');
 * // Returns:
 * // {
 * //   category: "primary-colors",
 * //   absoluteSrc: "/project/tokens/colors"
 * // }
 * 
 * // Another example with different structure
 * const result2 = getTokenSrcAndCategory('/app/design-tokens/components/Button.json');
 * // Returns:
 * // {
 * //   category: "button", 
 * //   absoluteSrc: "/app/design-tokens/components"
 * // }
 * 
 * // Usage in token processing
 * const tokens = loadTokensFromDirectory('/tokens');
 * tokens.forEach(tokenFile => {
 *   const { category, absoluteSrc } = getTokenSrcAndCategory(tokenFile.path);
 *   console.log(`Processing ${category} tokens from ${absoluteSrc}`);
 * });
 * ```
 */
export function getTokenSrcAndCategory(filePath: string) {
  const category = path
    .basename(filePath, path.extname(filePath))
    .toLowerCase();
  const absoluteSrc = path.dirname(filePath).toLowerCase();

  return {
    category,
    absoluteSrc,
  };
}
