import { TokenNode } from "@/token";
import { PLATFORM_HIERARCHY_CONFIG } from "../../constants";
import { convertSrcToPath } from "./convertSrcToPath";

/**
 * Resolves the complete inheritance hierarchy for a token's source location.
 * This function determines which theme hierarchies contain the given source path and returns
 * both ancestor paths (sources this token inherits FROM, ordered from current to most general)
 * and descendant paths (sources that inherit from this token, ordered from current to most specific),
 * providing a complete picture of token inheritance and override behavior.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.src - The source path of the token to locate in the hierarchy
 * @returns {Object} An object containing the complete hierarchy mappings
 * @returns {Record<string, string[]>} returns.ancestorPaths - Map of theme names to ancestor paths (reversed: current → most general)
 * @returns {Record<string, string[]>} returns.descendantPaths - Map of theme names to descendant paths (ordered: current → most specific)
 *
 * @example
 * ```typescript
 * // Find hierarchy paths for a web token
 * const result = getSourceHierarchyPaths({ src: "ui/web" });
 * console.log(result);
 * // {
 * //   ancestorPaths: {
 * //     "WEB_DEFAULT_LIGHT": ["src/ui/web", "src/ui/all-platforms"],  // Reversed order
 * //     "WEB_DEFAULT_DARK": ["src/ui/web", "src/ui/all-platforms"]
 * //   },
 * //   descendantPaths: {
 * //     "WEB_DEFAULT_LIGHT": ["src/ui/web", "src/ui/web/light", "src/ui/web/default-light"],
 * //     "WEB_DEFAULT_DARK": ["src/ui/web", "src/ui/web/dark", "src/ui/web/default-dark"]
 * //   }
 * // }
 *
 * // Find hierarchy for a universal token (root level)
 * const universalResult = getSourceHierarchyPaths({ src: "ui/all-platforms" });
 * console.log(universalResult.ancestorPaths);
 * // {
 * //   "WEB_DEFAULT_LIGHT": ["src/ui/all-platforms"],  // Only itself, no parents
 * //   "IOS_DEFAULT_LIGHT": ["src/ui/all-platforms"]
 * // }
 * console.log(universalResult.descendantPaths);
 * // {
 * //   "WEB_DEFAULT_LIGHT": ["src/ui/all-platforms", "src/ui/web", "src/ui/web/light"],
 * //   "IOS_DEFAULT_LIGHT": ["src/ui/all-platforms", "src/ui/ios", "src/ui/ios/light"]
 * // }
 *
 * // Find hierarchy for a highly specific token
 * const specificResult = getSourceHierarchyPaths({ src: "ui/web/dark/brand" });
 * console.log(specificResult.ancestorPaths);
 * // {
 * //   "WEB_BRAND_DARK": [
 * //     "src/ui/web/dark/brand",  // Current (reversed, so starts with self)
 * //     "src/ui/web/dark",
 * //     "src/ui/web",
 * //     "src/ui/all-platforms"
 * //   ]
 * // }
 * console.log(specificResult.descendantPaths);
 * // {
 * //   "WEB_BRAND_DARK": ["src/ui/web/dark/brand"]  // Most specific, no children
 * // }
 *
 * // Usage in understanding token inheritance (walking from current to root)
 * const token = { src: "ui/web/dark", name: "COLOR_PRIMARY" };
 * const { ancestorPaths, descendantPaths } = getSourceHierarchyPaths(token);
 *
 * console.log("Inheritance chain (current → root):");
 * Object.entries(ancestorPaths).forEach(([theme, paths]) => {
 *   console.log(`${theme}:`);
 *   paths.forEach((path, index) => {
 *     const label = index === 0 ? "Current" : index === paths.length - 1 ? "Root" : "Parent";
 *     console.log(`  ${label}: ${path}`);
 *   });
 * });
 *
 * console.log("Can be overridden by:");
 * Object.entries(descendantPaths).forEach(([theme, paths]) => {
 *   // Skip first (current level) to show only more specific paths
 *   paths.slice(1).forEach(path => console.log(`  ${theme}: ${path}`));
 * });
 *
 * // Usage in determining if token can access another token
 * const checkTokenAccess = (aliasToken: TokenNode, referencedToken: TokenNode) => {
 *   const aliasHierarchy = getSourceHierarchyPaths(aliasToken);
 *   const refHierarchy = getSourceHierarchyPaths(referencedToken);
 *
 *   Object.keys(aliasHierarchy.descendantPaths).forEach(theme => {
 *     const canAccess =
 *       // Can access any ancestor in the hierarchy
 *       aliasHierarchy.ancestorPaths[theme]?.some(path =>
 *         refHierarchy.ancestorPaths[theme]?.includes(path)
 *       ) ||
 *       // Can access tokens at same level
 *       aliasHierarchy.descendantPaths[theme]?.[0] === refHierarchy.descendantPaths[theme]?.[0];
 *
 *     console.log(`${theme}: ${canAccess ? '✓ Can access' : '✗ Cannot access'}`);
 *   });
 * };
 *
 * // Usage in finding override candidates
 * const findOverrideCandidates = (baseSrc: string) => {
 *   const { descendantPaths } = getSourceHierarchyPaths({ src: baseSrc });
 *
 *   console.log(`Tokens at these paths can override ${baseSrc}:`);
 *   Object.entries(descendantPaths).forEach(([theme, paths]) => {
 *     // Skip the first path (current level) to show only more specific paths
 *     const overridePaths = paths.slice(1);
 *     if (overridePaths.length > 0) {
 *       console.log(`\n${theme}:`);
 *       overridePaths.forEach(path => console.log(`  - ${path}`));
 *     }
 *   });
 * };
 *
 * findOverrideCandidates("ui/web");
 * // Output:
 * // Tokens at these paths can override ui/web:
 * // WEB_DEFAULT_LIGHT:
 * //   - src/ui/web/light
 * //   - src/ui/web/default-light
 * // WEB_DEFAULT_DARK:
 * //   - src/ui/web/dark
 * //   - src/ui/web/default-dark
 *
 * // Usage in walking inheritance chain from specific to general
 * const walkInheritanceChain = (token: TokenNode) => {
 *   const { ancestorPaths } = getSourceHierarchyPaths(token);
 *
 *   Object.entries(ancestorPaths).forEach(([theme, paths]) => {
 *     console.log(`\n${theme} inheritance chain:`);
 *     paths.forEach((path, index) => {
 *       const arrow = index === 0 ? "→" : "  →";
 *       console.log(`${arrow} ${path}`);
 *     });
 *   });
 * };
 *
 * walkInheritanceChain({ src: "ui/web/dark" });
 * // Output:
 * // WEB_DEFAULT_DARK inheritance chain:
 * // → src/ui/web/dark  (current)
 * //   → src/ui/web
 * //   → src/ui/all-platforms  (root)
 *
 * // Usage in validating token placement
 * const validateTokenPlacement = (token: TokenNode) => {
 *   const { ancestorPaths, descendantPaths } = getSourceHierarchyPaths(token);
 *
 *   const hasParents = Object.values(ancestorPaths).some(paths => paths.length > 1);
 *   const hasChildren = Object.values(descendantPaths).some(paths => paths.length > 1);
 *
 *   if (!hasParents) {
 *     console.log(`⚠️  Token at ${token.src} is at root level - no parent sources`);
 *   }
 *
 *   if (!hasChildren) {
 *     console.log(`ℹ️  Token at ${token.src} is most specific - cannot be overridden`);
 *   }
 *
 *   return { isRootLevel: !hasParents, isMostSpecific: !hasChildren };
 * };
 *
 * // Usage in finding all sources a token can inherit values from
 * const findInheritableSources = (src: string) => {
 *   const { ancestorPaths } = getSourceHierarchyPaths({ src });
 *
 *   console.log(`Token at ${src} can inherit from:`);
 *   Object.entries(ancestorPaths).forEach(([theme, paths]) => {
 *     // Skip first (current) to show only parent sources
 *     const inheritSources = paths.slice(1);
 *     if (inheritSources.length > 0) {
 *       console.log(`\n${theme}:`);
 *       inheritSources.forEach((path, index) => {
 *         console.log(`  ${index + 1}. ${path}`);
 *       });
 *     }
 *   });
 * };
 * ```
 */
export const getSourceHierarchyPaths = ({ src }: Pick<TokenNode, "src">) => {
  const themePaths = Object.entries(PLATFORM_HIERARCHY_CONFIG)
    .map(([theme, paths]) => {
      const filteredPaths = paths.filter(Boolean); // removing undefined and empty strings
      const findPathIndex = filteredPaths.findIndex(
        (path) => convertSrcToPath(src) === path
      );

      if (findPathIndex < 0) {
        return null;
      }

      return [
        theme,
        {
          // Ancestors: from current source to least specific sources (more general)
          ancestors: filteredPaths.slice(0, findPathIndex + 1).reverse(),
          // Descendants: from current source to more specific sources
          descendants: filteredPaths.slice(findPathIndex, filteredPaths.length),
        },
      ] as const;
    })
    .filter(Boolean) as [
    string,
    { ancestors: string[]; descendants: string[] }
  ][];

  const ancestorPaths: Record<string, string[]> = {};
  const descendantPaths: Record<string, string[]> = {};

  themePaths.forEach(([theme, { ancestors, descendants }]) => {
    ancestorPaths[theme] = ancestors;
    descendantPaths[theme] = descendants;
  });

  return { ancestorPaths, descendantPaths };
};
