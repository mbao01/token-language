import { TokenNode } from "@/token";

type FindTokenArgs = {
  query: Pick<TokenNode, "name" | "src" | "category"> & {
    isDefinition?: boolean;
  };
  tokens: TokenNode[];
};

/**
 * 
 * @param param0 This function locates a token by it's definition
 * @returns the token itself (if a definition) or it's parent
 */
export const getClosestToken = ({ query, tokens }: FindTokenArgs) => {
  const foundToken = tokens.find((t) => {
    const isNameFound = query.isDefinition
      ? t.name === query.name
      : t.originalValue === `{!${query.name}}`;
    return (
      isNameFound && query.src.endsWith(t.src) && t.category === query.category
    );
  });

  return foundToken;
};
