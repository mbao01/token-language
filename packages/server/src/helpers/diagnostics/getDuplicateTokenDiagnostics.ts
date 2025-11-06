import {
  type Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import type { TextDocument } from "vscode-languageserver-textdocument";
import { TOKEN_DEFINITION_REGEX } from "tokens-utilities/constants";
import type { CapabilitiesOptions } from "../types";
import {
  colorToFnRGBA,
  findMatchingThemeTokens,
  hasColorValue,
  hasMatchingName,
  hasMatchingTheme,
  parseTokenFilePath,
} from "tokens-utilities/helpers";
import type { TokenNode } from "tokens-utilities/types";

export const getDuplicateTokenDiagnostics = async (
  tokens: TokenNode[],
  textDocument: TextDocument,
  options?: CapabilitiesOptions
) => {
  const text = textDocument.getText();
  let m: RegExpExecArray | null;
  const diagnostics: Diagnostic[] = [];

  while ((m = TOKEN_DEFINITION_REGEX.exec(text))) {
    const name = m[1];

    const { absoluteSrc, category } = parseTokenFilePath(textDocument.uri);

    if (!(name && absoluteSrc && category)) return [];

    const query = {
      name,
      src: absoluteSrc,
      category,
      isDefinition: true,
    };

    const { themeTokenMap, allThemeTokens } = findMatchingThemeTokens({
      query,
      tokens,
    });

    const duplicates: any[] = [];

    Object.entries(allThemeTokens).forEach(([theme, tokens]) => {
      const token = themeTokenMap[theme];

      tokens.forEach((t) => {
        if (!(hasMatchingName(t, token) && hasMatchingTheme(t, token))) {
          if (!hasColorValue(t.value) || !hasColorValue(token.value)) {
            const isValueMatching = t.value === token.value;
            if (isValueMatching) duplicates.push(t);
          } else {
            const isValueMatching =
              colorToFnRGBA(t.value) === colorToFnRGBA(token.value);

            if (isValueMatching) duplicates.push(t);
          }
        }
      });
    });

    if (!duplicates.length) continue;

    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Information,
      code: "duplicate-token",
      codeDescription: {
        href: "https://example.com/docs/diagnostics/duplicate-token",
      },
      data: "Some data",
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `Duplicates found for '${m[1]}'. Please ensure token values are unique.`,
      source: "IntelliTokens",
    };

    if (options?.hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = duplicates.map((token) => {
        return {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: `File: ${category}, Is a definition? ${query.isDefinition}`,
        };
      });
    }

    diagnostics.push(diagnostic);
  }

  return diagnostics;
};
