/**
 * Converts a token source path to a full file system path by prefixing with 'src/'.
 * This utility function transforms relative token source paths into absolute paths
 * within the project structure, primarily used for file system operations and
 * hierarchy path matching.
 *
 * @param {string} src - The relative source path to convert (e.g., "ui/web", "components/button")
 * @returns {string} The full path prefixed with 'src/', or the original value if empty
 *
 * @example
 * ```typescript
 * // Basic path conversion
 * const fullPath = convertSrcToPath("ui/web");
 * console.log(fullPath); // "src/ui/web"
 * 
 * // Platform-specific path
 * const iosPath = convertSrcToPath("ui/ios");
 * console.log(iosPath); // "src/ui/ios"
 * 
 * // Component path
 * const componentPath = convertSrcToPath("components/button");
 * console.log(componentPath); // "src/components/button"
 * 
 * // Empty string handling
 * const emptyPath = convertSrcToPath("");
 * console.log(emptyPath); // ""
 * 
 * // Usage in file path construction
 * const token = {
 *   src: "ui/web",
 *   category: "colors"
 * };
 * const filePath = `${convertSrcToPath(token.src)}/${token.category}.json`;
 * console.log(filePath); // "src/ui/web/colors.json"
 * 
 * // Usage in hierarchy matching
 * const hierarchyPaths = ["src/ui/all-platforms", "src/ui/web", "src/ui/web/dark"];
 * const tokenSrc = "ui/web";
 * const matchFound = hierarchyPaths.includes(convertSrcToPath(tokenSrc));
 * console.log(matchFound); // true
 * 
 * // Batch conversion for multiple tokens
 * const tokens = [
 *   { src: "ui/web" },
 *   { src: "ui/ios" },
 *   { src: "components/button" }
 * ];
 * 
 * const fullPaths = tokens.map(t => convertSrcToPath(t.src));
 * console.log(fullPaths);
 * // ["src/ui/web", "src/ui/ios", "src/components/button"]
 * ```
 */
export const convertSrcToPath = (src: string) => {
  if (src) return `src/${src}`;

  return src;
};
