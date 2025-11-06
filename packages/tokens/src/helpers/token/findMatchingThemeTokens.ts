import { TokenNode } from "@/token";
import { PLATFORM_HIERARCHY_CONFIG } from "../../constants";

type FindTokenArgs = {
  query: Pick<TokenNode, "name" | "src" | "category"> & {
    isDefinition?: boolean;
  };
  tokens: TokenNode[];
};

/**
 * Finds a matching token based on name, source path, and category.
 * This function can locate either a token definition directly or find the parent token
 * that an alias token references.
 *
 * @param {FindTokenArgs} params - The search parameters
 * @param {Object} params.query - The token query parameters
 * @param {string} params.query.name - The name of the token to find
 * @param {string} params.query.src - The source path where the token should be located
 * @param {string} params.query.category - The category/type of the token
 * @param {boolean} [params.query.isDefinition=false] - Whether to search for the token definition itself or its reference
 * @param {TokenNode[]} params.tokens - Array of all available tokens to search through
 * @returns {TokenNode | undefined} The matching token if found, undefined otherwise
 *
 * @example
 * ```typescript
 * // Find a token definition
 * const definitionToken = findMatchingToken({
 *   query: {
 *     name: "COLOR_PRIMARY",
 *     src: "colors/primary.json",
 *     category: "colors",
 *     isDefinition: true
 *   },
 *   tokens: allTokens
 * });
 *
 * // Find an alias token that references another token
 * const { exists, paths } = findTokenThemePaths({
 *   query: {
 *     name: "BUTTON_COLOR",
 *     src: "components/button.json",
 *     category: "components",
 *     isDefinition: false
 *   },
 *   tokens: allTokens
 * });
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
          path.endsWith(t.src) &&
          platform === t.platform &&
          mode === t.mode &&
          (t.buildName.startsWith(buildName) || t.buildName === "default")
      );
      if (foundPath)
        allThemeTokens[theme] = [...(allThemeTokens[theme] || []), t];

      if (foundThemeToken[theme] && foundThemeToken[theme].buildName !== 'default') return;
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
