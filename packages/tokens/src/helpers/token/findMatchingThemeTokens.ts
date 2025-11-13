import { TokenNode } from "@/token";
import { PLATFORM_HIERARCHY_CONFIG } from "../../constants";
import { convertSrcToPath } from "./convertSrcToPath";
import { findMatchingToken } from "./findMatchingToken";

type FindTokenArgs = {
  query: Pick<TokenNode, "name" | "src" | "category"> & {
    isDefinition?: boolean;
  };
  tokens: TokenNode[];
};

/**
 * Finds and organizes tokens across different theme configurations based on platform hierarchy.
 * This function searches for tokens matching the given criteria and organizes them by theme
 * according to the platform hierarchy configuration. It respects theme inheritance and platform
 * specificity, returning both individual theme mappings and collections of all theme variants.
 *
 * @param {FindTokenArgs} params - The search parameters object
 * @param {Object} params.query - The token query parameters for matching
 * @param {string} params.query.name - The exact name of the token to search for
 * @param {string} params.query.src - The source path where the token should be located
 * @param {string} params.query.category - The category/classification of the token
 * @param {boolean} [params.query.isDefinition=false] - Whether to search for token definitions or alias references
 * @param {TokenNode[]} params.tokens - Complete array of all available tokens to search through
 * @returns {Object} An object containing theme-organized token results
 * @returns {boolean} returns.exists - Whether any matching tokens were found across themes
 * @returns {Record<string, TokenNode | null>} returns.themeTokenMap - Map of theme names to their primary token
 * @returns {Record<string, TokenNode[]>} returns.allThemeTokens - Map of theme names to all tokens in that theme
 *
 * @example
 * ```typescript
 * // Find a color token across all themes
 * const result = findMatchingThemeTokens({
 *   query: {
 *     name: "COLOR_PRIMARY",
 *     src: "ui/all-platforms",
 *     category: "colors",
 *     isDefinition: true
 *   },
 *   tokens: allTokens
 * });
 *
 * console.log(result.exists); // true if found in any theme
 * console.log(result.themeTokenMap);
 * // {
 * //   "WEB_DEFAULT_LIGHT": TokenNode,
 * //   "WEB_DEFAULT_DARK": TokenNode,
 * //   "IOS_DEFAULT_LIGHT": TokenNode,
 * //   ...
 * // }
 *
 * console.log(result.allThemeTokens);
 * // {
 * //   "WEB_DEFAULT_LIGHT": [TokenNode1, TokenNode2],
 * //   "WEB_DEFAULT_DARK": [TokenNode3],
 * //   ...
 * // }
 *
 * // Find an alias token with inheritance
 * const aliasResult = findMatchingThemeTokens({
 *   query: {
 *     name: "BUTTON_BACKGROUND",
 *     src: "components/web",
 *     category: "button",
 *     isDefinition: false
 *   },
 *   tokens: allTokens
 * });
 *
 * // Check if token exists across themes
 * if (aliasResult.exists) {
 *   Object.entries(aliasResult.themeTokenMap).forEach(([theme, token]) => {
 *     if (token) {
 *       console.log(`${theme}: ${token.value} (${token._tokenType})`);
 *     }
 *   });
 * }
 *
 * // Usage in diagnostics for finding duplicates
 * const diagnosticData = findMatchingThemeTokens({
 *   query: { name: "SPACING_MD", src: "spacing", category: "spacing", isDefinition: true },
 *   tokens: allTokens
 * });
 *
 * Object.entries(diagnosticData.allThemeTokens).forEach(([theme, tokens]) => {
 *   if (tokens.length > 1) {
 *     console.warn(`Multiple tokens found for theme ${theme}:`, tokens.map(t => t.src));
 *   }
 * });
 *
 * // Usage in theme comparison
 * const comparison = findMatchingThemeTokens({
 *   query: { name: "FONT_SIZE_BODY", src: "typography", category: "fonts" },
 *   tokens: allTokens
 * });
 *
 * const lightThemes = Object.entries(comparison.themeTokenMap)
 *   .filter(([theme]) => theme.includes('LIGHT'))
 *   .map(([theme, token]) => ({ theme, value: token?.value }));
 * ```
 */
export const findMatchingThemeTokens = ({ query, tokens }: FindTokenArgs) => {
  const themePaths = Object.entries(PLATFORM_HIERARCHY_CONFIG)
    .map(([theme, paths]) => {
      const filteredPaths = paths.filter(Boolean);
      const findPathIndex = filteredPaths.findIndex((path) =>
        query.src.endsWith(path)
      );
      if (findPathIndex < 0) {
        return null;
      }

      return [
        theme,
        filteredPaths.slice(0, findPathIndex + 1).reverse(),
      ] as const;
    })
    .filter(Boolean) as [string, string[]][];

  const foundThemeToken: Record<string, TokenNode | null> = {};
  const allThemeTokens: Record<string, TokenNode[]> = {};

  tokens.find((t) => {
    const isNameFound =
      t.name === query.name &&
      (query.isDefinition ? true : t._tokenType === "alias");

    if (!isNameFound) return false;

    themePaths.forEach(([theme, paths]) => {
      const [platform, buildName, ...rest] = theme.toLowerCase().split("_");
      const mode = rest.reverse()[0];

      // Note: t.src is like ui/all-platforms while path is like src/ui/all-platforms
      const foundPath = paths.find(
        (path) =>
          convertSrcToPath(t.src) === path &&
          platform === t.platform &&
          mode === t.mode &&
          (t.buildName.startsWith(buildName) || t.buildName === "default")
      );
      if (foundPath)
        allThemeTokens[theme] = [...(allThemeTokens[theme] || []), t];

      if (
        foundThemeToken[theme] &&
        foundThemeToken[theme].buildName !== "default"
      )
        return;
      if (foundPath) foundThemeToken[theme] = t || null;
    });
  });

  const foundTokens = Object.entries(foundThemeToken).map(([, t]) => t);
  const tokenExists =
    foundTokens.length > 0 && foundTokens.every((t) => Boolean(t));

  return {
    exists: tokenExists,
    themeTokenMap: foundThemeToken,
    allThemeTokens,
  };
};
