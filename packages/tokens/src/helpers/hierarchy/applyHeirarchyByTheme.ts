import { TokenNode } from "@/token";
import { HIERARCHY } from "../../constants/hierarchy";
import { getTokenThemeKey } from "../token/getTokenThemeKey";
import { getHierarchyKeys } from "./getHierarchyKeys";

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
