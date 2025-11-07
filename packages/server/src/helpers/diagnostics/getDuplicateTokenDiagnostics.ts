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
  findMatchingThemeTokens,
  getTokenDiagnosticsLink,
  hasColorValue,
  hasMatchingName,
  hasMatchingTheme,
  parseTokenFilePath,
} from "tokens-utilities/helpers";
import type { TokenNode } from "tokens-utilities/types";
import { findLocationInSource } from "../token/findLocationInSource";

/**
 * Analyzes a text document to find and report duplicate token definitions across themes.
 * This function scans token definition files for duplicate values or original values across
 * different source locations, generating VS Code diagnostics with detailed information about
 * the duplicates including their locations and conflicting values.
 *
 * @param {TokenNode[]} tokens - Complete array of all available tokens to analyze for duplicates
 * @param {TextDocument} textDocument - The VS Code text document being analyzed for diagnostics
 * @param {CapabilitiesOptions} [options] - Optional language server capabilities configuration
 * @param {boolean} [options.hasDiagnosticRelatedInformationCapability] - Whether to include related information in diagnostics
 * @returns {Promise<Diagnostic[]>} Promise resolving to array of diagnostic objects for duplicate tokens
 *
 * @example
 * ```typescript
 * // Basic usage in language server
 * const diagnostics = await getDuplicateTokenDiagnostics(
 *   allTokens,
 *   document,
 *   { hasDiagnosticRelatedInformationCapability: true }
 * );
 * 
 * console.log(`Found ${diagnostics.length} duplicate token issues`);
 * 
 * // Example diagnostic output for duplicate color values
 * // {
 * //   severity: DiagnosticSeverity.Information,
 * //   code: "duplicate-token",
 * //   message: "Duplicates found for 'COLOR_PRIMARY'. Please ensure token values are unique.",
 * //   range: { start: { line: 5, character: 4 }, end: { line: 5, character: 17 } },
 * //   relatedInformation: [
 * //     {
 * //       location: { uri: "file:///src/themes/dark/colors.json", range: {...} },
 * //       message: "Value: #007bff ❌ duplicate\nOriginal value: #007bff\nIs a definition? true"
 * //     }
 * //   ]
 * // }
 *
 * // Integration with VS Code language server
 * connection.onDidChangeContent(async (change) => {
 *   const document = documents.get(change.document.uri);
 *   if (document) {
 *     const duplicateDiagnostics = await getDuplicateTokenDiagnostics(
 *       loadedTokens,
 *       document,
 *       clientCapabilities
 *     );
 *     
 *     // Send diagnostics to client
 *     connection.sendDiagnostics({
 *       uri: document.uri,
 *       diagnostics: duplicateDiagnostics
 *     });
 *   }
 * });
 *
 * // Example with color token duplicates
 * const colorTokens = [
 *   {
 *     name: "COLOR_PRIMARY",
 *     value: "#007bff",
 *     src: "ui/web",
 *     category: "colors",
 *     theme: "light"
 *   },
 *   {
 *     name: "COLOR_PRIMARY", 
 *     value: "#007bff", // Same value - will be flagged as duplicate
 *     src: "ui/mobile",
 *     category: "colors", 
 *     theme: "light"
 *   }
 * ];
 * 
 * const diagnostics = await getDuplicateTokenDiagnostics(
 *   colorTokens,
 *   document
 * );
 * // Returns diagnostic highlighting the duplicate color value
 *
 * // Example with alias token duplicates
 * const aliasTokens = [
 *   {
 *     name: "BUTTON_COLOR",
 *     originalValue: "{!COLOR_PRIMARY}",
 *     src: "components/web",
 *     category: "button"
 *   },
 *   {
 *     name: "BUTTON_COLOR",
 *     originalValue: "{!COLOR_PRIMARY}", // Same reference - duplicate
 *     src: "components/mobile", 
 *     category: "button"
 *   }
 * ];
 *
 * // Usage in CI/CD validation
 * const validateTokenFile = async (filePath: string) => {
 *   const document = TextDocument.create(filePath, 'json', 1, fileContent);
 *   const diagnostics = await getDuplicateTokenDiagnostics(allTokens, document);
 *   
 *   if (diagnostics.length > 0) {
 *     console.error(`❌ Found ${diagnostics.length} duplicate token issues in ${filePath}`);
 *     diagnostics.forEach(d => console.error(`  - ${d.message}`));
 *     process.exit(1);
 *   }
 * };
 *
 * // Advanced color comparison handling
 * // The function intelligently compares colors using RGBA conversion:
 * // - "#ff0000" and "rgb(255, 0, 0)" are detected as duplicates
 * // - "#007bff" and "hsl(211, 100%, 50%)" are compared after conversion
 * // - Non-color values use direct string comparison
 * ```
 */
export const getDuplicateTokenDiagnostics = async (
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

    const { themeTokenMap, allThemeTokens } = findMatchingThemeTokens({
      query,
      tokens,
    });

    const duplicates: {
      token: TokenNode;
      isValueMatching: boolean;
      isOriginalValueMatching: boolean;
    }[] = [];

    Object.entries(allThemeTokens).forEach(([theme, tokens]) => {
      const token = themeTokenMap[theme];

      tokens.forEach((t) => {
        if (!(hasMatchingName(t, token) && hasMatchingTheme(t, token))) {
          if (t.src !== token.src) {
            const isColorToken =
              !hasColorValue(t.value) || !hasColorValue(token.value);
            const isValueMatching = isColorToken
              ? t.value === token.value
              : colorToFnRGBA(t.value) === colorToFnRGBA(token.value);
            const isOriginalValueMatching =
              t.originalValue === token.originalValue;

            if (isValueMatching || isOriginalValueMatching)
              duplicates.push({
                token: t,
                isValueMatching,
                isOriginalValueMatching,
              });
          }
        }
      });
    });

    if (!duplicates.length) continue;

    const code = "duplicate-token";
    const diagnostic: Diagnostic = {
      code,
      severity: DiagnosticSeverity.Information,
      codeDescription: {
        href: getTokenDiagnosticsLink(code),
      },
      data: "Some data",
      range: {
        start: textDocument.positionAt(index),
        end: textDocument.positionAt(index + found.length),
      },
      message: `Duplicates found for '${name}'. Please ensure token values are unique.`,
      source: "IntelliTokens",
    };

    if (options?.hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = duplicates
        .map(({ token, isValueMatching, isOriginalValueMatching }) => {
          const location = findLocationInSource(token, { isDefinition });

          if (!location) return;

          return {
            location,
            message: [
              "",
              `Value: ${token.value} ${isValueMatching ? "❌ duplicate" : ""}`,
              `Original value: ${token.originalValue} ${
                isOriginalValueMatching ? "❌ duplicate" : ""
              }`,
              `Is a definition? ${query.isDefinition}`,
            ].join("\n"),
          };
        })
        .filter(Boolean) as Diagnostic["relatedInformation"];
    }

    diagnostics.push(diagnostic);
  }

  return diagnostics;
};
