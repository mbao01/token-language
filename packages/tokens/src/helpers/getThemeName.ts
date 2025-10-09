import { TokenNode } from "@/token";

export const getThemeName = (token: TokenNode) => {
  return `${token.buildName}-${token.theme}-${token.mode}`;
};
