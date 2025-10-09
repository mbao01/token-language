import { type TokenNode } from "@/token";
import { isSameName } from "./isSameName";
import { isSamePlatform } from "./isSamePlatform";
import { isSameTheme } from "./isSameTheme";
import { getThemeName } from "./getThemeName";

export const getThemeComparison = (token: TokenNode, tokens: TokenNode[]) => {
  const headers: string[] = [];
  const tokensMap = new Map();
  const headersSet = new Set();

  const similarTokens = tokens.filter(
    (t) => isSameName(t, token) && isSamePlatform(t, token)
  );

  similarTokens.forEach((t) => {
    const { name, value, originalValue } = t;
    const tokenObject = tokensMap.get(name) || {};
    const key = getThemeName(t);

    const originalToken = tokens.find(
      (t) =>
        t._tokenType === "alias" &&
        `{!${t.name}}` === originalValue &&
        isSameTheme(t, token)
    );

    const tokenValue = originalToken?.value ?? value ?? "";
    tokenObject[key] = {
      value:
        typeof tokenValue === "string" && tokenValue.includes(",")
          ? `"${tokenValue}"`
          : tokenValue,
      src: t.src,
    };

    headersSet.add(key);
    tokensMap.set(name, tokenObject);
  });

  const sortedHeaders = [...headersSet].sort() as string[];

  const csvDataArray: { value: string; src: string }[] = [];
  [...tokensMap].forEach(([, obj]) => {
    Object.entries(obj).forEach(([k, v]) => {
      sortedHeaders.push(k);
      csvDataArray.push(v as { value: string; src: string });
    });
  });

  const comparison = {
    headers: headers.concat(sortedHeaders),
    content: csvDataArray,
  };

  return comparison;
};
