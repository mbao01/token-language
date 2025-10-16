import { TokenNode } from "@/token";

/**
 * Generates hierarchy keys for a token based on its platform, build configuration, and theme properties.
 * This function creates uppercase identifier keys that are used to match tokens against the hierarchy
 * configuration. It handles both platform-specific and universal ('all-platforms') tokens differently.
 * 
 * @param {TokenNode} token - The token to generate hierarchy keys for
 * @param {string} token.platform - The target platform (web, ios, android)
 * @param {string} token.buildName - The build identifier, typically organization-region format
 * @param {string} token.mode - The color mode (light, dark)
 * @param {string} token.theme - The theme name (default for base theme)
 * @param {string} token.src - The source path to determine if token is universal
 * @returns {string[]} Array of uppercase hierarchy key strings used for token matching
 * 
 * @example
 * ```typescript
 * // Platform-specific token
 * const webToken = {
 *   platform: "web",
 *   buildName: "acme-us", 
 *   mode: "light",
 *   theme: "brand",
 *   src: "web/colors",
 *   // ... other properties
 * };
 * 
 * const webKeys = getHierarchyKeys(webToken);
 * console.log(webKeys); // ["WEB_ACME_US_BRAND_LIGHT"]
 * 
 * // Universal token (all-platforms)
 * const universalToken = {
 *   platform: "web",
 *   buildName: "acme-us",
 *   mode: "light", 
 *   theme: "default", // Default theme
 *   src: "all-platforms/colors",
 *   // ... other properties
 * };
 * 
 * const universalKeys = getHierarchyKeys(universalToken);
 * console.log(universalKeys); // ["ACME_US", "ACME_US"]
 * 
 * // Custom theme universal token
 * const customUniversalToken = {
 *   ...universalToken,
 *   theme: "brand"
 * };
 * 
 * const customKeys = getHierarchyKeys(customUniversalToken);
 * console.log(customKeys); // ["ACME_US", "ACME_US_BRAND"]
 * 
 * // Usage in hierarchy matching
 * const keys = getHierarchyKeys(token);
 * const matchingHierarchy = HIERARCHY_CONFIG.filter(hierarchy => 
 *   keys.some(key => hierarchy.name.includes(key))
 * );
 * ```
 */
export const getHierarchyKeys = ({
  platform,
  buildName,
  mode,
  theme,
  src,
}: TokenNode): string[] => {
  const _buildName = buildName.replace("-", "_");
  const keys = src.includes("all-platforms")
    ? [[_buildName], [_buildName, theme === "default" ? undefined : theme]]
    : [
        [
          platform,
          buildName.replace("-", "_"),
          theme === "default" ? undefined : theme,
          mode,
        ],
      ];

  return keys.map((key) => key.filter(Boolean).join("_").toUpperCase());
};
