import {
  type Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import type { TextDocument } from "vscode-languageserver-textdocument";
import { TOKEN_VALUE_REGEX } from "tokens-utilities/constants";
import type { CapabilitiesOptions } from "../types";
import {
  findMatchingThemeTokens,
  getTokenDiagnosticsLink,
  parseTokenFilePath,
} from "tokens-utilities/helpers";
import type { TokenNode } from "tokens-utilities/types";

export const getValueTokenDiagnostics = async (
  tokens: TokenNode[],
  textDocument: TextDocument,
  options?: CapabilitiesOptions
) => {
  const text = textDocument.getText();
  let match: RegExpExecArray | null;
  const diagnostics: Diagnostic[] = [];

  while ((match = TOKEN_VALUE_REGEX.exec(text))) {
    const name = match[1];

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

    const code = "missing-token";
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
      message: `'${match[1]}' is not a valid token/alias.\nTo fix the error, replace please replace '${match[0]}' with a valid token or alias that exists in the token set.`,
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
