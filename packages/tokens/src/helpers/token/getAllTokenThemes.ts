import { type TokenNode } from "@/token";
import { isSameName } from "./isSameName";
import { isSamePlatform } from "./isSamePlatform";
import { applyHeirarchyByTheme } from "../hierarchy/applyHeirarchyByTheme";

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
