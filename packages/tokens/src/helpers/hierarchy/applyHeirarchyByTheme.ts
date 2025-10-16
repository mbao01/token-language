import { TokenNode } from "@/token";
import { HIERARCHY } from "../../constants/hierarchy";
import { getTokenThemeKey } from "../token/getTokenThemeKey";
import { getHierarchyKeys } from "./getHierarchyKeys";

/**
 * Sorts tokens by hierarchy precedence based on their source paths and hierarchy configuration.
 * This internal function organizes tokens according to the predefined hierarchy rules,
 * ensuring the most specific tokens take precedence over more general ones.
 * 
 * @param {TokenNode | undefined} reference - Optional reference token to generate hierarchy keys
 * @param {TokenNode[]} tokens - Array of tokens to sort by hierarchy
 * @returns {Record<string, TokenNode>} Object mapping platform names to their corresponding tokens
 */
const sortTokensByHierarchy = (
  reference: TokenNode | undefined,
  tokens: TokenNode[]
) => {
  const keys = reference ? getHierarchyKeys(reference) : undefined;
  const sortedTokens: Record<string, TokenNode> = {};

  tokens.forEach((token) => {
    Object.entries(HIERARCHY).filter(([theme, hierarchy]) => {
      if (!keys || keys.some((key) => theme.includes(key))) {
        const sources = [...hierarchy].filter(Boolean);
        sources.forEach((src) => {
          if (src.endsWith(token.src)) {
            sortedTokens[token.platform] = token;
          }
        });
      }
    });
  });

  return sortedTokens;
};

/**
 * Applies hierarchy-based organization to tokens grouped by theme.
 * This function takes a collection of tokens and organizes them first by theme configuration,
 * then applies hierarchy rules within each theme to determine precedence and platform-specific
 * token selection.
 * 
 * @param {TokenNode | undefined} reference - Optional reference token used for hierarchy key generation
 * @param {TokenNode[]} tokens - Array of tokens to organize by theme and hierarchy
 * @returns {Object} Object containing the reference token and organized theme data
 * @returns {TokenNode | undefined} returns.reference - The reference token passed as input
 * @returns {Record<string, Record<string, TokenNode>>} returns.themes - Themes mapped to platform-specific tokens
 * 
 * @example
 * ```typescript
 * const referenceToken = {
 *   name: "COLOR_PRIMARY",
 *   platform: "web",
 *   buildName: "acme-us",
 *   theme: "brand",
 *   mode: "light",
 *   // ... other properties
 * };
 * 
 * const similarTokens = [
 *   { ...referenceToken, platform: "web", src: "web/colors" },
 *   { ...referenceToken, platform: "ios", src: "ios/colors" },
 *   { ...referenceToken, theme: "dark", mode: "dark", src: "web/colors" },
 *   { ...referenceToken, platform: "web", src: "all-platforms/colors" }
 * ];
 * 
 * const organized = applyHeirarchyByTheme(referenceToken, similarTokens);
 * console.log(organized);
 * // Returns:
 * // {
 * //   reference: referenceToken,
 * //   themes: {
 * //     "acme-us-brand-light": {
 * //       "web": TokenNode,
 * //       "ios": TokenNode
 * //     },
 * //     "acme-us-dark-dark": {
 * //       "web": TokenNode
 * //     }
 * //   }
 * // }
 * 
 * // Usage in token comparison and selection
 * const { themes } = applyHeirarchyByTheme(baseToken, allVariations);
 * Object.entries(themes).forEach(([themeKey, platforms]) => {
 *   console.log(`Theme: ${themeKey}`);
 *   Object.entries(platforms).forEach(([platform, token]) => {
 *     console.log(`  ${platform}: ${token.value}`);
 *   });
 * });
 * 
 * // Usage in inheritance and fallback scenarios
 * const { themes } = applyHeirarchyByTheme(undefined, tokens);
 * const fallbackTokens = themes['default-default-light'] || {};
 * ```
 */
export const applyHeirarchyByTheme = (
  reference: TokenNode | undefined,
  tokens: TokenNode[]
) => {
  // so we have a list of tokens with the same name, and same theme, how do we sort by heirarchy?
  // from most specific to least specific!
  const themesMap: Record<string, TokenNode[]> = {};

  tokens.forEach((token) => {
    const theme = getTokenThemeKey(token);
    themesMap[theme] = themesMap[theme] || [];
    themesMap[theme].push(token);
  });

  const sortedThemesMap: Record<string, Record<string, TokenNode>> = {};
  Object.entries(themesMap).forEach(([theme, themeTokens]) => {
    sortedThemesMap[theme] = sortTokensByHierarchy(reference, themeTokens);
  });

  return {
    reference,
    themes: sortedThemesMap,
  };
};
