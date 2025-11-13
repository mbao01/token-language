import fs from "fs";
import path from "path";
import { URI } from "vscode-uri";
import { Position } from "vscode-languageserver-textdocument";
import type { TokenNode } from "tokens-utilities/types";
import { getGlobalSettings } from "../getDocumentSettings";

/**
 * Converts a character index position in text to a line/character Position object.
 * This utility function calculates the line and character coordinates for a given
 * index position within a text string, accounting for newline characters.
 *
 * @param {string} text - The text content to analyze
 * @param {number} index - The zero-based character index to convert
 * @returns {Position} Position object with line and character properties
 *
 * @example
 * ```typescript
 * const text = "Hello\nWorld\nExample";
 * const position = indexToPosition(text, 8); // Points to 'r' in "World"
 * console.log(position); // { line: 1, character: 2 }
 *
 * // Start of text
 * const start = indexToPosition(text, 0);
 * console.log(start); // { line: 0, character: 0 }
 *
 * // After first newline
 * const afterNewline = indexToPosition(text, 6);
 * console.log(afterNewline); // { line: 1, character: 0 }
 * ```
 */
const indexToPosition = (text: string, index: number): Position => {
  let line = 0,
    character = 0;
  for (let i = 0; i < index; i++) {
    if (text[i] === "\n") {
      line++;
      character = 0;
    } else {
      character++;
    }
  }
  return { line, character };
};

/**
 * Finds the source file Location of a token definition or reference.
 * This function locates a token within its source JSON file and returns
 * the URI and position range for use in language server features like
 * go-to-definition, diagnostics, and code navigation.
 *
 * @param {TokenNode} token - The token to locate in source files
 * @param {Object} options - Configuration options for the search
 * @param {boolean} options.isDefinition - Whether to search for the token definition or a reference to it
 * @returns {Object | undefined} Location object with URI and range, or undefined if not found
 * @returns {string} returns.uri - The file URI where the token was found
 * @returns {Object} returns.range - The position range of the token in the file
 * @returns {Position} returns.range.start - Start position (line/character) of the token
 * @returns {Position} returns.range.end - End position (line/character) of the token
 *
 * @example
 * ```typescript
 * // Find a token definition location
 * const tokenDefinition = {
 *   name: "COLOR_PRIMARY",
 *   src: "ui/web",
 *   category: "colors",
 *   // ... other properties
 * };
 *
 * const location = findLocationInSource(tokenDefinition, { isDefinition: true });
 * if (location) {
 *   console.log(`Found at: ${location.uri}`);
 *   console.log(`Line ${location.range.start.line}, Character ${location.range.start.character}`);
 * }
 * // Output: Found at: file:///project/src/ui/web/colors.json
 * //         Line 15, Character 4
 *
 * // Find a token reference (alias usage)
 * const aliasToken = {
 *   name: "BUTTON_COLOR",
 *   src: "components/web",
 *   category: "button",
 *   originalValue: "{!COLOR_PRIMARY}",
 *   // ... other properties
 * };
 *
 * const refLocation = findLocationInSource(aliasToken, { isDefinition: false });
 * // Searches for "{!BUTTON_COLOR" pattern instead of "BUTTON_COLOR" definition
 *
 * // Usage in diagnostics
 * const diagnostic = {
 *   message: "Duplicate token found",
 *   range: location?.range,
 *   relatedInformation: [{
 *     location: findLocationInSource(duplicateToken, { isDefinition: true }),
 *     message: "Original definition here"
 *   }]
 * };
 *
 * // Usage in go-to-definition
 * const handleGoToDefinition = (token: TokenNode) => {
 *   const location = findLocationInSource(token, { isDefinition: true });
 *   if (location) {
 *     // Navigate to the token definition
 *     return {
 *       uri: location.uri,
 *       range: location.range
 *     };
 *   }
 * };
 *
 * // Usage in find references
 * const findTokenReferences = (baseToken: TokenNode, allTokens: TokenNode[]) => {
 *   const references = [];
 *
 *   allTokens.forEach(token => {
 *     if (token.originalValue.includes(`{!${baseToken.name}}`)) {
 *       const location = findLocationInSource(token, { isDefinition: false });
 *       if (location) references.push(location);
 *     }
 *   });
 *
 *   return references;
 * };
 * ```
 */

export const findLocationInSource = (
  token: Pick<TokenNode, "src" | "category" | "name">,
  { isDefinition }: { isDefinition: boolean }
) => {
  const settings = getGlobalSettings();
  const folderPath = path.join(settings.tokens.srcPackage, "src");
  const filePath = path.join(folderPath, token.src, `${token.category}.json`);
  const uri = URI.file(filePath);
  const text = fs.readFileSync(uri.fsPath, "utf8");

  if (!text) return;

  const regex = new RegExp(
    isDefinition ? `"${token.name}"` : `"{!${token.name}}`,
    "g"
  );
  const match = regex.exec(text);
  if (!match) return;

  return {
    uri: uri.toString(),
    range: {
      start: indexToPosition(text, match.index),
      end: indexToPosition(text, match.index + match[0].length),
    },
  };
};
