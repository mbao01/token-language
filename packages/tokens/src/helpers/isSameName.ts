import { TokenNode } from "@/token";

export const isSameName = (a: TokenNode, b: TokenNode) => {
  return a.name === b.name;
};
