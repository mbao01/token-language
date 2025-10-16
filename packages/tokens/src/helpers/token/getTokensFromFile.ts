import { type TokenNode } from "@/token";
import fs from "fs";

/**
 * Reads and parses token data from a JSON file.
 * This function safely loads token definitions from a file system path,
 * validates the content, and returns the parsed tokens array.
 * 
 * @param {string} filepath - The absolute path to the JSON file containing token definitions
 * @returns {TokenNode[] | undefined} Array of parsed tokens if successful, undefined if parsing fails
 * 
 * @throws {Error} When the file doesn't contain valid token data or cannot be read
 * 
 * @example
 * ```typescript
 * // Load tokens from a file
 * const tokens = getTokensFromFile('/path/to/tokens/colors.json');
 * 
 * if (tokens) {
 *   console.log(`Loaded ${tokens.length} tokens`);
 *   tokens.forEach(token => {
 *     console.log(`Token: ${token.name}, Value: ${token.value}`);
 *   });
 * } else {
 *   console.error('Failed to load tokens');
 * }
 * 
 * // Example file content structure:
 * // [
 * //   {
 * //     "name": "COLOR_PRIMARY",
 * //     "_tokenType": "token",
 * //     "value": "#007bff",
 * //     "src": "colors",
 * //     // ... other TokenNode properties
 * //   }
 * // ]
 * ```
 */
export const getTokensFromFile = (filepath: string) => {
  try {
    const data = fs.readFileSync(filepath, { encoding: "utf-8" });
    const tokens = JSON.parse(data);

    if (!tokens || !Array.isArray(tokens)) {
      throw new Error(
        `No tokens found in ${filepath}. Please ensure that is the right absolute file path to your tokens.`
      );
    }

    return tokens as TokenNode[];
  } catch (error) {
    console.error(
      `Failed to load token from ${filepath}: `,
      (error as Error)?.message
    );
  }
};
