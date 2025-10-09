import { type TokenNode } from "@/token";

export const getTokenUniqueIdentifier = (token: TokenNode) => {
  return `${token.name}+${token.buildName}+${token.theme}+${token._tokenType}+${token.src}`
    .replaceAll("/", "_")
    .toLowerCase();
};
