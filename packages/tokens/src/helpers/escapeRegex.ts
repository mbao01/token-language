/**
 * Escapes all special regular expression characters in a string to make it safe for use in regex patterns.
 * This function ensures that when a string is used as a literal search pattern in a regular expression,
 * special characters like `.`, `*`, `+`, etc., are treated as literal characters rather than regex operators.
 *
 * @param {string} str - The string to escape for use in a regular expression
 * @returns {string} The escaped string with all special regex characters properly escaped with backslashes
 *
 * @example
 * ```typescript
 * // Escape a token name with special characters
 * const tokenName = "COLOR_PRIMARY.light";
 * const escaped = escapeRegex(tokenName);
 * console.log(escaped);
 * // "COLOR_PRIMARY\\.light"
 *
 * // Use escaped string in regex pattern to find exact match
 * const pattern = new RegExp(`"(${escapeRegex("COLOR_PRIMARY")})"`, "g");
 * const text = '"COLOR_PRIMARY": "#FF0000"';
 * const match = pattern.exec(text);
 * console.log(match[1]); // "COLOR_PRIMARY"
 *
 * // Escape characters that have special meaning in regex
 * console.log(escapeRegex("price*")); // "price\\*"
 * console.log(escapeRegex("amount+")); // "amount\\+"
 * console.log(escapeRegex("text?")); // "text\\?"
 * console.log(escapeRegex("value^")); // "value\\^"
 * console.log(escapeRegex("item$")); // "item\\$"
 * console.log(escapeRegex("data[0]")); // "data\\[0\\]"
 * console.log(escapeRegex("obj.prop")); // "obj\\.prop"
 * console.log(escapeRegex("path/to/file")); // "path\\/to\\/file"
 * console.log(escapeRegex("a|b")); // "a\\|b"
 * console.log(escapeRegex("group(1)")); // "group\\(1\\)"
 *
 * // Usage in searching for token names with special characters
 * const findTokenInText = (tokenName: string, text: string) => {
 *   const escapedName = escapeRegex(tokenName);
 *   const regex = new RegExp(`"${escapedName}"\\s*:\\s*`, "g");
 *   return regex.test(text);
 * };
 *
 * findTokenInText("COLOR.PRIMARY", '"COLOR.PRIMARY": "#FF0000"'); // true
 * findTokenInText("SIZE[small]", '"SIZE[small]": "8px"'); // true
 *
 * // Usage in diagnostic matching
 * const matchTokenDefinition = (name: string, jsonText: string) => {
 *   const pattern = new RegExp(`"(${escapeRegex(name)})"`, "g");
 *   let match;
 *   const matches = [];
 *
 *   while ((match = pattern.exec(jsonText)) !== null) {
 *     matches.push({
 *       token: match[1],
 *       index: match.index,
 *       length: match[0].length,
 *     });
 *   }
 *
 *   return matches;
 * };
 *
 * // Without escapeRegex, special characters would break the pattern
 * const unsafePattern = new RegExp(`"(COLOR.PRIMARY)"`, "g"); // . matches any character!
 * const safePattern = new RegExp(`"(${escapeRegex("COLOR.PRIMARY")})"`, "g"); // . is literal
 *
 * // Characters escaped by this function:
 * // - (hyphen/minus)
 * // [ ] (square brackets)
 * // / (forward slash)
 * // { } (curly braces)
 * // ( ) (parentheses)
 * // * (asterisk)
 * // + (plus)
 * // ? (question mark)
 * // . (period/dot)
 * // \ (backslash)
 * // ^ (caret)
 * // $ (dollar sign)
 * // | (pipe)
 * ```
 */
export const escapeRegex = (str: string): string => {
    // Escape all special regex characters
    // - . * + ? ^ $ { } ( ) | [ ] \ /
    // Note: inside character class, - needs escaping
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}