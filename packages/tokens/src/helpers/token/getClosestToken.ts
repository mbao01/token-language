import { TokenNode } from "@/token";

type FindTokenArgs = {
  query: Pick<TokenNode, "name" | "src" | "category"> & {
    isDefinition?: boolean;
  };
  tokens: TokenNode[];
};

/**
 * Finds the closest matching token based on name, source path, and category.
 * This function can locate either a token definition directly or find the parent token
 * that an alias token references.
 * 
 * @param {FindTokenArgs} params - The search parameters
 * @param {Object} params.query - The token query parameters
 * @param {string} params.query.name - The name of the token to find
 * @param {string} params.query.src - The source path where the token should be located
 * @param {string} params.query.category - The category/type of the token
 * @param {boolean} [params.query.isDefinition=false] - Whether to search for the token definition itself or its reference
 * @param {TokenNode[]} params.tokens - Array of all available tokens to search through
 * @returns {TokenNode | undefined} The matching token if found, undefined otherwise
 * 
 * @example
 * ```typescript
 * // Find a token definition
 * const definitionToken = getClosestToken({
 *   query: {
 *     name: "COLOR_PRIMARY",
 *     src: "colors/primary.json",
 *     category: "colors",
 *     isDefinition: true
 *   },
 *   tokens: allTokens
 * });
 * 
 * // Find an alias token that references another token
 * const aliasToken = getClosestToken({
 *   query: {
 *     name: "BUTTON_COLOR",
 *     src: "components/button.json", 
 *     category: "components",
 *     isDefinition: false
 *   },
 *   tokens: allTokens
 * });
 * ```
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
