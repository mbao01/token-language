import { TokenNode } from "@/token";

export const getTokenThemeKey = (token: TokenNode) => {
  return `${token.buildName}-${token.theme}-${token.mode}`;
};
