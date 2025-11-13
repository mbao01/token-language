import {
  type Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import type { TextDocument } from "vscode-languageserver-textdocument";
import {
  SRC_DEFAULT_PATHS,
  TOKEN_DEFINITION_REGEX,
} from "tokens-utilities/constants";
import type { CapabilitiesOptions } from "../types";
import {
  colorToFnRGBA,
  convertSrcToPath,
  findMatchingThemeTokens,
  findMatchingToken,
  getSourceHierarchyPaths,
  getTokenDiagnosticsLink,
  hasColorValue,
  hasMatchingName,
  hasMatchingTheme,
  parseTokenFilePath,
} from "tokens-utilities/helpers";
import type { TokenNode } from "tokens-utilities/types";
import { findLocationInSource } from "../token/findLocationInSource";

/**
 * Analyzes a text document to detect unused alias tokens that are not referenced anywhere.
 * This function scans alias token files to identify tokens that are defined but never used
 * by other tokens in the system, generating VS Code warning diagnostics to help maintain
 * clean token definitions by removing unnecessary aliases.
 *
 * @param {TokenNode[]} tokens - Complete array of all available tokens to analyze for unused aliases
 * @param {TextDocument} textDocument - The VS Code text document being analyzed for diagnostics
 * @param {CapabilitiesOptions} [options] - Optional language server capabilities configuration
 * @param {boolean} [options.hasDiagnosticRelatedInformationCapability] - Whether to include related information in diagnostics
 * @returns {Promise<Diagnostic[]>} Promise resolving to array of diagnostic objects for unused alias tokens
 *
 * @example
 * ```typescript
 * // Basic usage in language server
 * const diagnostics = await getAliasTokenDiagnostics(
 *   allTokens,
 *   document,
 *   { hasDiagnosticRelatedInformationCapability: true }
 * );
 *
 * console.log(`Found ${diagnostics.length} unused alias warnings`);
 *
 * // Example diagnostic output for unused alias
 * // {
 * //   severity: DiagnosticSeverity.Warning,
 * //   code: "unused-alias",
 * //   message: "Unused alias found for 'COLOR_ACCENT'. Consider removing it if not needed.",
 * //   range: { start: { line: 8, character: 4 }, end: { line: 8, character: 16 } },
 * //   relatedInformation: [
 * //     {
 * //       location: { uri: "file:///src/aliases-colors.json", range: {...} },
 * //       message: "Alias defined at ui/web/aliases-colors.json is not used."
 * //     }
 * //   ]
 * // }
 *
 * // Integration with VS Code language server
 * connection.onDidChangeContent(async (change) => {
 *   const document = documents.get(change.document.uri);
 *   if (document) {
 *     const aliasDiagnostics = await getAliasTokenDiagnostics(
 *       loadedTokens,
 *       document,
 *       clientCapabilities
 *     );
 *
 *     // Send diagnostics to client
 *     connection.sendDiagnostics({
 *       uri: document.uri,
 *       diagnostics: aliasDiagnostics
 *     });
 *   }
 * });
 *
 * // Example with unused alias detection
 * const tokenSystem = [
 *   {
 *     name: "COLOR_PRIMARY",
 *     value: "#007bff",
 *     _tokenType: "token",
 *     src: "ui/web",
 *     category: "colors"
 *   },
 *   {
 *     name: "COLOR_ACCENT",
 *     originalValue: "{!COLOR_PRIMARY}",
 *     _tokenType: "alias",
 *     src: "ui/web",
 *     category: "aliases-colors" // Detected as alias by filename pattern
 *   },
 *   // No token references COLOR_ACCENT - will be flagged as unused
 * ];
 *
 * const diagnostics = await getAliasTokenDiagnostics(tokenSystem, document);
 * // Returns warning diagnostic for COLOR_ACCENT
 *
 * // Example with used alias (no warning)
 * const usedAliasSystem = [
 *   {
 *     name: "COLOR_PRIMARY",
 *     value: "#007bff",
 *     _tokenType: "token",
 *     src: "ui/web",
 *     category: "colors"
 *   },
 *   {
 *     name: "COLOR_ACCENT",
 *     originalValue: "{!COLOR_PRIMARY}",
 *     _tokenType: "alias",
 *     src: "ui/web",
 *     category: "aliases-colors"
 *   },
 *   {
 *     name: "BUTTON_COLOR",
 *     originalValue: "{!COLOR_ACCENT}", // Uses COLOR_ACCENT
 *     _tokenType: "alias",
 *     src: "components/web",
 *     category: "button"
 *   }
 * ];
 *
 * const noDiagnostics = await getAliasTokenDiagnostics(usedAliasSystem, document);
 * // Returns empty array - COLOR_ACCENT is used by BUTTON_COLOR
 *
 * // Usage in CI/CD for code quality
 * const validateAliasUsage = async (filePath: string) => {
 *   const document = TextDocument.create(filePath, 'json', 1, fileContent);
 *   const diagnostics = await getAliasTokenDiagnostics(allTokens, document);
 *
 *   if (diagnostics.length > 0) {
 *     console.warn(`⚠️  Found ${diagnostics.length} unused aliases in ${filePath}`);
 *     diagnostics.forEach(d => {
 *       console.warn(`  - ${d.message}`);
 *     });
 *     // Optionally fail build or just warn
 *   }
 * };
 *
 * // Usage in refactoring workflows
 * const cleanupUnusedAliases = async () => {
 *   const allFiles = await getTokenFiles();
 *   const unusedAliases = [];
 *
 *   for (const file of allFiles) {
 *     const document = TextDocument.create(file.path, 'json', 1, file.content);
 *     const diagnostics = await getAliasTokenDiagnostics(allTokens, document);
 *     unusedAliases.push(...diagnostics);
 *   }
 *
 *   console.log(`Found ${unusedAliases.length} unused aliases to clean up`);
 *   // Proceed with cleanup or review
 * };
 *
 * // Alias detection logic
 * // - Identifies aliases by checking if category starts with "aliases"
 * // - Checks if alias is referenced in any token's originalValue
 * // - Respects theme hierarchy when checking for usage
 * // - Only flags aliases in the same theme/platform context
 * ```
 */
export const getAliasTokenDiagnostics = async (
  tokens: TokenNode[],
  textDocument: TextDocument,
  options?: CapabilitiesOptions
) => {
  const text = textDocument.getText();
  let match: RegExpExecArray | null;
  const diagnostics: Diagnostic[] = [];

  const { absoluteSrc, category } = parseTokenFilePath(textDocument.uri);
  const isSrcDefaultPath = SRC_DEFAULT_PATHS.some((path) =>
    absoluteSrc?.includes(path)
  );

  if (!(absoluteSrc && category) || isSrcDefaultPath) return diagnostics;

  while ((match = TOKEN_DEFINITION_REGEX.exec(text))) {
    const index = match.index;
    const found = match[0];
    const name = match[1];

    if (!name) return [];

    const isDefinition = true;
    const query = {
      name,
      src: absoluteSrc,
      category,
      isDefinition,
    };
    const token = findMatchingToken({ query, tokens });

    if (!token) continue;

    const unused: {
      token: Pick<TokenNode, "src" | "category" | "name">;
      isUnusedAlias: true;
    }[] = [];

    // TODO:: confirm this - using the name of the file to check if it is an alias
    const isAlias = token.category.startsWith("aliases");
    let isUsedAlias = false;
    const { descendantPaths } = getSourceHierarchyPaths(token);

    tokens.forEach((t) => {
      if (!(hasMatchingName(t, token) && hasMatchingTheme(t, token))) {
        const isSrcInHierarchy = Object.values(descendantPaths).some((paths) =>
          paths.some((p) => convertSrcToPath(t.src) === p)
        );

        if (isAlias && (isSrcInHierarchy || t.src === token.src)) {
          if (t.originalValue.includes(`{!${token.name}}`)) {
            isUsedAlias = true;
          }
        }
      }
    });

    if (isAlias && !isUsedAlias) {
      unused.push({
        token,
        isUnusedAlias: true,
      });
    }

    if (unused.length) {
      const code = "unused-alias";
      const diagnostic: Diagnostic = {
        code,
        severity: DiagnosticSeverity.Warning,
        codeDescription: {
          href: getTokenDiagnosticsLink(code),
        },
        data: "Some data",
        range: {
          start: textDocument.positionAt(index),
          end: textDocument.positionAt(index + found.length),
        },
        message: `Unused alias found for '${name}'. Consider removing it if not needed.`,
        source: "IntelliTokens",
      };

      if (options?.hasDiagnosticRelatedInformationCapability) {
        diagnostic.relatedInformation = unused
          .map(({ token }) => {
            const location = findLocationInSource(token, { isDefinition });

            if (!location) return;

            return {
              location,
              message: `Alias defined at ${token.src}/${token.category}.json is not used.`,
            };
          })
          .filter(Boolean) as Diagnostic["relatedInformation"];
      }

      diagnostics.push(diagnostic);
    }
  }

  return diagnostics;
};
