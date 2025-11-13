import {
  type Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import type { TextDocument } from "vscode-languageserver-textdocument";
import { TOKEN_STRUCTURE_REGEX } from "tokens-utilities/constants";
import type { CapabilitiesOptions } from "../types";
import { escapeRegex, getTokenDiagnosticsLink } from "tokens-utilities/helpers";

/**
 * Validates token names against the required naming convention and generates diagnostics for invalid tokens.
 * This function checks that all token names follow the proper structure: uppercase letters, underscores
 * (not at the start or end), numbers only after underscores, and no spaces or special characters.
 *
 * The naming convention enforces:
 * - Only uppercase letters (A-Z)
 * - Underscores for word separation (not at start/end)
 * - Numbers allowed only after underscores
 * - No spaces or other special characters
 *
 * Valid examples: `COLOR_PRIMARY`, `SIZE_SMALL`, `SPACING_2X`, `FONT_WEIGHT_700`
 * Invalid examples: `color_primary` (lowercase), `_COLOR` (starts with underscore), `COLOR2` (number without underscore)
 *
 * @param {TextDocument} textDocument - The text document to analyze for invalid token names
 * @param {CapabilitiesOptions} [options] - Optional capabilities configuration for enhanced diagnostic information
 * @param {boolean} [options.hasDiagnosticRelatedInformationCapability] - If true, adds related information to diagnostics
 * @returns {Promise<Diagnostic[]>} Array of diagnostic objects for each invalid token name found
 *
 * @example
 * ```typescript
 * // Analyze a token file for invalid names
 * const diagnostics = await getInvalidTokenDiagnostics(textDocument);
 * console.log(diagnostics);
 * // [
 * //   {
 * //     code: "invalid-token",
 * //     severity: DiagnosticSeverity.Error,
 * //     range: { start: { line: 2, character: 5 }, end: { line: 2, character: 18 } },
 * //     message: "'color_primary' is not the right structure for a token...",
 * //     source: "IntelliTokens"
 * //   }
 * // ]
 *
 * // Example token file with invalid names
 * const tokenFile = {
 *   "aliases": {
 *     "COLOR_PRIMARY": "#FF0000",     // ✓ Valid
 *     "color_secondary": "#00FF00",   // ✗ Invalid: lowercase
 *     "_SIZE_SMALL": "8px",           // ✗ Invalid: starts with underscore
 *     "FONT2": "Arial",               // ✗ Invalid: number without underscore
 *     "SPACING 2X": "16px",           // ✗ Invalid: contains space
 *     "BORDER-COLOR": "#000",         // ✗ Invalid: contains hyphen
 *     "SIZE_LARGE_": "24px",          // ✗ Invalid: ends with underscore
 *   }
 * };
 *
 * // With enhanced capabilities
 * const diagnosticsWithInfo = await getInvalidTokenDiagnostics(
 *   textDocument,
 *   { hasDiagnosticRelatedInformationCapability: true }
 * );
 * console.log(diagnosticsWithInfo[0].relatedInformation);
 * // [
 * //   {
 * //     location: { uri: "file:///tokens.json", range: {...} },
 * //     message: "Is a definition? true"
 * //   }
 * // ]
 *
 * // Valid token name patterns
 * const validNames = [
 *   "COLOR_PRIMARY",           // Basic
 *   "COLOR_PRIMARY_DARK",      // Multiple words
 *   "FONT_SIZE_2XL",          // Number after underscore
 *   "SPACING_16",             // Number suffix
 *   "BUTTON_BACKGROUND_HOVER", // Long name
 * ];
 *
 * // Invalid token name patterns
 * const invalidNames = [
 *   "color_primary",          // Lowercase
 *   "ColorPrimary",           // Mixed case
 *   "_COLOR_PRIMARY",         // Starts with underscore
 *   "COLOR_PRIMARY_",         // Ends with underscore
 *   "COLOR2PRIMARY",          // Number without underscore
 *   "COLOR-PRIMARY",          // Contains hyphen
 *   "COLOR PRIMARY",          // Contains space
 *   "COLOR.PRIMARY",          // Contains period
 *   "COLOR_prímary",          // Non-ASCII characters
 * ];
 *
 * // Usage in language server validation workflow
 * const validateDocument = async (document: TextDocument) => {
 *   const invalidTokenDiagnostics = await getInvalidTokenDiagnostics(document);
 *   const duplicateDiagnostics = await getDuplicateTokenDiagnostics(document);
 *   const aliasDiagnostics = await getAliasTokenDiagnostics(document);
 *
 *   // Combine all diagnostics
 *   return [
 *     ...invalidTokenDiagnostics,
 *     ...duplicateDiagnostics,
 *     ...aliasDiagnostics,
 *   ];
 * };
 *
 * // The diagnostic includes a clickable link to documentation
 * const diagnostic = diagnostics[0];
 * console.log(diagnostic.codeDescription?.href);
 * // "https://docs.ci.nutmeg.co.uk/nutkit/jpmx/latest/?path=/story/guidelines-tokens-diagnostics--invalid-token"
 *
 * // Error message format
 * console.log(diagnostic.message);
 * // "'color_primary' is not the right structure for a token.
 * //  Use only uppercase letters, underscores (not at ends), numbers only after underscores, and no spaces."
 *
 * // Integration with VS Code
 * connection.sendDiagnostics({
 *   uri: textDocument.uri,
 *   diagnostics: await getInvalidTokenDiagnostics(textDocument, {
 *     hasDiagnosticRelatedInformationCapability: true,
 *   }),
 * });
 * ```
 */
export const getInvalidTokenDiagnostics = async (
  textDocument: TextDocument,
  options?: CapabilitiesOptions
) => {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];
  let jsonData: Record<string, object>;
  try {
    jsonData = JSON.parse(text); // e.g { "aliases": { "PRIMARY_COLOR": "#FF0000" } }
  } catch (error) {
    return diagnostics;
  }

  Object.entries(jsonData).forEach(([, value]) => {
    if (typeof value !== "string" && !Array.isArray(value)) {
      Object.keys(value).forEach((name) => {
        const isInvalid = !TOKEN_STRUCTURE_REGEX.test(`"${name}"`);
        if (isInvalid) {
          const match = new RegExp(`"(${escapeRegex(name)})"`).exec(text);

          if (match) {
            const isDefinition = true;
            const query = {
              name,
              isDefinition,
            };

            const code = "invalid-token";
            const diagnostic: Diagnostic = {
              code,
              severity: DiagnosticSeverity.Error,
              codeDescription: {
                href: getTokenDiagnosticsLink(code),
              },
              data: "Some data",
              range: {
                start: textDocument.positionAt(match.index),
                end: textDocument.positionAt(match.index + match[0].length),
              },
              message: `'${name}' is not the right structure for a token.\n Use only uppercase letters, underscores (not at ends), numbers only after underscores, and no spaces.`,
              source: "IntelliTokens",
            };
            if (options?.hasDiagnosticRelatedInformationCapability) {
              diagnostic.relatedInformation = [
                {
                  location: {
                    uri: textDocument.uri,
                    range: Object.assign({}, diagnostic.range),
                  },
                  message: `Is a definition? ${query.isDefinition}`,
                },
              ];
            }
            diagnostics.push(diagnostic);
          }
        }
      });
    }
  });

  return diagnostics;
};
