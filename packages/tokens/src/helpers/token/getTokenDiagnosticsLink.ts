type DiagnosticCode =
  | "missing-token" // ✅
  | "invalid-token" // ✅
  | "mismatched-type"
  | "duplicate-token" // ✅
  | "duplicate-token-value" // ✅
  | "duplicate-token-definition" // ✅
  | "unused-alias"; // ✅

/**
 * Generates a documentation URL for a specific token diagnostic code.
 * This function creates links to the Storybook documentation where detailed explanations
 * and resolution steps for each diagnostic error/warning can be found.
 *
 * @param {DiagnosticCode} code - The diagnostic code to generate a documentation link for
 * @returns {string} The complete URL to the diagnostic documentation page
 *
 * @example
 * ```typescript
 * // Get documentation link for missing token error
 * const link = getTokenDiagnosticsLink("missing-token");
 * console.log(link);
 * // "https://docs.ci.nutmeg.co.uk/nutkit/jpmx/latest/?path=/story/guidelines-tokens-diagnostics--missing-token"
 *
 * // Get documentation link for invalid token error
 * const invalidLink = getTokenDiagnosticsLink("invalid-token");
 * console.log(invalidLink);
 * // "https://docs.ci.nutmeg.co.uk/nutkit/jpmx/latest/?path=/story/guidelines-tokens-diagnostics--invalid-token"
 *
 * // Usage in diagnostic creation
 * const diagnostic: Diagnostic = {
 *   code: "duplicate-token",
 *   severity: DiagnosticSeverity.Error,
 *   codeDescription: {
 *     href: getTokenDiagnosticsLink("duplicate-token"), // Provides clickable link in IDE
 *   },
 *   message: "Token is defined multiple times",
 * };
 *
 * // Usage in error messages with helpful links
 * const createDiagnosticWithDocs = (code: DiagnosticCode, message: string) => {
 *   const docLink = getTokenDiagnosticsLink(code);
 *   return {
 *     code,
 *     message: `${message}\n\nSee documentation: ${docLink}`,
 *     codeDescription: { href: docLink },
 *   };
 * };
 *
 * // All supported diagnostic codes
 * const allLinks = [
 *   getTokenDiagnosticsLink("missing-token"),        // Token reference cannot be resolved
 *   getTokenDiagnosticsLink("invalid-token"),        // Token name doesn't follow naming convention
 *   getTokenDiagnosticsLink("mismatched-type"),      // Token type doesn't match expected type
 *   getTokenDiagnosticsLink("duplicate-token"),      // Token defined multiple times
 *   getTokenDiagnosticsLink("duplicate-token-value"), // Multiple tokens have same value
 *   getTokenDiagnosticsLink("duplicate-token-definition"), // Token defined in multiple files
 *   getTokenDiagnosticsLink("unused-alias"),         // Alias token is never referenced
 * ];
 * ```
 */
export const getTokenDiagnosticsLink = (code: DiagnosticCode): string => {
  const diagnosticsUrl = `https://docs.ci.nutmeg.co.uk/nutkit/jpmx/latest/?path=/story/guidelines-tokens-diagnostics--${code}`;

  return diagnosticsUrl;
};
