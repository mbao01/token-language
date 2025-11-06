import { TokenNode } from "@/token";

export const getTokenExplorerLink = (token: TokenNode): string => {
  const args = `token:${token.name};platform:${token.platform};buildName:${token.buildName};nutkitTheme:${token.theme};mode:${token.mode}`;
  const tokenUrl = `https://docs.ci.nutmeg.co.uk/nutkit/jpmx/latest/?path=/story/guidelines-tokens--explorer&args=${args}`;

  return tokenUrl;
};
