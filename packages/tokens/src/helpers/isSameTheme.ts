import { TokenNode } from "@/token";

export const isSameTheme = (a: TokenNode, b: TokenNode) => {
  return (
    a.buildName === b.buildName &&
    a.theme === b.theme &&
    a.mode === b.mode &&
    a.platform === b.platform
  );
};
