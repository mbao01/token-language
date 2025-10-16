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
 * console.log(hasMatchingPlatform(webToken, iosToken)); // false - different platforms
 * console.log(hasMatchingPlatform(webToken, universalToken)); // true - universal token
 * console.log(hasMatchingPlatform(iosToken, universalToken)); // true - universal token
 * 
 * // Usage in filtering platform-compatible tokens
 * const compatibleTokens = allTokens.filter(token => 
 *   hasMatchingPlatform(targetToken, token)
 * );
 * 
 * // Usage in token inheritance scenarios
 * const inheritedTokens = tokens.filter(t => 
 *   hasMatchingPlatform(baseToken, t) && t.name === baseToken.name
 * );
 * ```
 */
export const hasMatchingPlatform = (a: TokenNode, b: TokenNode) => {
  return b.src.includes('all-platforms') || hasExactPlatformMatch(a, b);
};

/**
 * Strictly compares two tokens to determine if they have exactly the same platform.
 * Unlike `hasMatchingPlatform`, this function does not consider universal tokens and
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
 * console.log(hasExactPlatformMatch(webToken, iosToken)); // false
 * console.log(hasExactPlatformMatch(webToken, universalWebToken)); // true
 * console.log(hasMatchingPlatform(webToken, universalWebToken)); // true
 * console.log(hasMatchingPlatform(iosToken, universalWebToken)); // true (different from strict)
 * ```
 */
export const hasExactPlatformMatch = (a: TokenNode, b: TokenNode) => {
  return a.platform === b.platform;
};
