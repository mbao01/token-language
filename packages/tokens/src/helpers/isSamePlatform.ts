import { TokenNode } from "@/token";

export const isSamePlatform = (a: TokenNode, b: TokenNode) => {
  return b.src.includes('all-platforms') || isStrictlySamePlatform(a, b);
};

export const isStrictlySamePlatform = (a: TokenNode, b: TokenNode) => {
  return a.platform === b.platform;
};
