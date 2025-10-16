import { type TokenNode } from "@/token";
import { isSameName } from "./isSameName";
import { isSamePlatform } from "./isSamePlatform";
import { applyHeirarchyByTheme } from "../hierarchy/applyHeirarchyByTheme";

/**
 * Retrieves all theme variations of a given token by finding similar tokens across different themes.
 * This function finds tokens with the same name and platform but different themes, then organizes 
 * them by theme and platform for comparison purposes.
 * 
 * @param {TokenNode} token - The reference token to find theme variations for
 * @param {TokenNode[]} tokens - Array of all available tokens to search through
 * @returns {Object} An object containing headers and content for theme comparison
 * @returns {string[]} returns.headers - Array of headers including 'theme' and platform names
 * @returns {Record<string, TokenNode | string>[]} returns.content - Array of rows, each containing theme and platform-specific tokens
 * 
 * @example
 * ```typescript
 * const primaryColorToken = {
 *   name: "COLOR_PRIMARY",
 *   platform: "web",
 *   theme: "light",
 *   // ... other properties
 * };
 * 
 * const allTokens = [
 *   primaryColorToken,
 *   { name: "COLOR_PRIMARY", platform: "web", theme: "dark", ... },
 *   { name: "COLOR_PRIMARY", platform: "ios", theme: "light", ... },
 * ];
 * 
 * const comparison = getAllTokenThemes(primaryColorToken, allTokens);
 * // Returns:
 * // {
 * //   headers: ["theme", "web", "ios"],
 * //   content: [
 * //     { theme: "light", web: TokenNode, ios: TokenNode },
 * //     { theme: "dark", web: TokenNode }
 * //   ]
 * // }
 * ```
 */
export const getAllTokenThemes = (token: TokenNode, tokens: TokenNode[]) => {
  type TokenTheme = {
    value: string;
    src: string;
  };

  const tokenTheme: Record<string, TokenTheme> = {};

  const similarTokens = tokens.filter(
    (t) => isSameName(t, token) && isSamePlatform(t, token)
  );

  // similarTokens.forEach((t) => {
  //   const { value, originalValue } = t;
  //   const key = getTokenThemeKey(t);

  //   const originalToken = tokens.find(
  //     (t) =>
  //       t._tokenType === "alias" &&
  //       `{!${t.name}}` === originalValue &&
  //       isSameTheme(t, token)
  //   );
  //   const tokenValue = originalToken?.value ?? value ?? "";
  //   // use inheritance here
  //   tokenTheme[key] = {
  //     value:
  //       typeof tokenValue === "string" && tokenValue.includes(",")
  //         ? `"${tokenValue}"`
  //         : tokenValue,
  //     src: t.src,
  //   };
  // });

  const { themes } = applyHeirarchyByTheme(undefined, similarTokens);

  let headers: string[] = [];
  const content: Record<string, TokenNode | string>[] = [];
  Object.entries(themes).forEach(([theme, platformTokens]) => {
    const row: Record<string, TokenNode | string> = { theme };
    Object.entries(platformTokens).forEach(([platform, t]) => {
      headers.push(platform);
      row[platform] = t;
    });
    content.push(row);
  });
  headers = ["theme", ...new Set(headers)];

  const comparison = {
    headers,
    content,
  };

  return comparison;
};
