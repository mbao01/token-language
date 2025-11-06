import {
  type Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import type { TextDocument } from "vscode-languageserver-textdocument";
import { TOKEN_VALUE_REGEX } from "tokens-utilities/constants";
import type { CapabilitiesOptions } from "../types";
import {
  findMatchingThemeTokens,
  parseTokenFilePath,
} from "tokens-utilities/helpers";
import type { TokenNode } from "tokens-utilities/types";

export const getValueTokenDiagnostics = async (
  tokens: TokenNode[],
  textDocument: TextDocument,
  options?: CapabilitiesOptions
) => {
  const text = textDocument.getText();
  let m: RegExpExecArray | null;
  const diagnostics: Diagnostic[] = [];

  while ((m = TOKEN_VALUE_REGEX.exec(text))) {
    const name = m[1];

    const { absoluteSrc, category } = parseTokenFilePath(textDocument.uri);

    if (!(name && absoluteSrc && category)) return [];

    const query = {
      name,
      src: absoluteSrc,
      category,
      isDefinition: false,
    };

    const { exists } = findMatchingThemeTokens({ query, tokens });

    if (exists) continue;

    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Error,
      code: "missing-token",
      codeDescription: {
        href: "https://example.com/docs/diagnostics/missing-token",
      },
      data: "Some data",
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `'${m[1]}' is not a valid token/alias.`,
      source: "IntelliTokens",
    };
    if (options?.hasDiagnosticRelatedInformationCapability) {
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: `File: ${category}, Is a definition? ${query.isDefinition}`,
        },
      ];
    }
    diagnostics.push(diagnostic);
  }
  return diagnostics;
};
