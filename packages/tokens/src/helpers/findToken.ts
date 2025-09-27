import { TokenNode } from "../../../../types/token";

type FindTokenArgs = {
  query: Pick<TokenNode, "name" | "src" | "category"> & {
    isDefinition?: boolean;
  };
  tokens: TokenNode[];
};
export const findToken = ({ query, tokens }: FindTokenArgs) => {
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
