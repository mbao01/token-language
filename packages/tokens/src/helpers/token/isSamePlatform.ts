import { TokenNode } from "@/token";

/**
 * Determines if two tokens belong to the same platform or if one is a universal token.
 * This function checks if tokens are compatible from a platform perspective, considering
 * that tokens from 'all-platforms' sources are compatible with any platform.
 * 
 * @param {TokenNode} a - The first token to compare
 * @param {TokenNode} b - The second token to compare
 * @returns {boolean} True if tokens are from the same platform or one is universal, false otherwise
 * 
 * @example
 * ```typescript
 * const webToken = {
 *   platform: "web",
 *   src: "web/colors",
 *   // ... other properties
 * };
 * 
 * const iosToken = {
 *   platform: "ios", 
 *   src: "ios/colors",
 *   // ... other properties
 * };
 * 
 * const universalToken = {
 *   platform: "web",
 *   src: "all-platforms/colors", // Universal token
 *   // ... other properties
 * };
 * 
 * console.log(isSamePlatform(webToken, iosToken)); // false - different platforms
 * console.log(isSamePlatform(webToken, universalToken)); // true - universal token
 * console.log(isSamePlatform(iosToken, universalToken)); // true - universal token
 * 
 * // Usage in filtering platform-compatible tokens
 * const compatibleTokens = allTokens.filter(token => 
 *   isSamePlatform(targetToken, token)
 * );
 * 
 * // Usage in token inheritance scenarios
 * const inheritedTokens = tokens.filter(t => 
 *   isSamePlatform(baseToken, t) && t.name === baseToken.name
 * );
 * ```
 */
export const isSamePlatform = (a: TokenNode, b: TokenNode) => {
  return b.src.includes('all-platforms') || isStrictlySamePlatform(a, b);
};

/**
 * Strictly compares two tokens to determine if they have exactly the same platform.
 * Unlike `isSamePlatform`, this function does not consider universal tokens and
 * requires an exact platform match.
 * 
 * @param {TokenNode} a - The first token to compare
 * @param {TokenNode} b - The second token to compare
 * @returns {boolean} True if both tokens have exactly the same platform, false otherwise
 * 
 * @example
 * ```typescript
 * const webToken = { platform: "web", src: "web/colors" };
 * const iosToken = { platform: "ios", src: "ios/colors" };
 * const universalWebToken = { platform: "web", src: "all-platforms/colors" };
 * 
 * console.log(isStrictlySamePlatform(webToken, iosToken)); // false
 * console.log(isStrictlySamePlatform(webToken, universalWebToken)); // true
 * console.log(isSamePlatform(webToken, universalWebToken)); // true
 * console.log(isSamePlatform(iosToken, universalWebToken)); // true (different from strict)
 * ```
 */
export const isStrictlySamePlatform = (a: TokenNode, b: TokenNode) => {
  return a.platform === b.platform;
};
