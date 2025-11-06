import path from "path";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getDocumentSettings, getGlobalSettings } from "./getDocumentSettings";
import type { CapabilitiesOptions } from "./types";
import { getValueTokenDiagnostics } from "./diagnostics/getValueTokenDiagnostics";
import { loadTokensFromFile } from "tokens-utilities/helpers";
import { getDuplicateTokenDiagnostics } from "./diagnostics";

// 1. create a function that generates a missing token diagnostic

// 2. create a function that generates a duplicate token diagnostic

// 3. create a function that generates a mismatched type diagnostic

// 4. create a function that generates a duplicate token value diagnostic

export const validateTextDocument = async (
  textDocument: TextDocument,
  options?: CapabilitiesOptions
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  const settings = getGlobalSettings();
  if (!(settings.tokens?.srcPackage && settings.tokens?.json)) {
    return diagnostics;
  }

  if (!textDocument.uri.includes(path.join(settings.tokens.srcPackage, "src"))) {
    return diagnostics;
  }

  const tokens = loadTokensFromFile(settings.tokens.json);
  if (!tokens) {
    return diagnostics;
  }

  // get value token diagnostics
  const valueTokenDiagnostics = await getValueTokenDiagnostics(
    tokens,
    textDocument,
    options
  );
  diagnostics.push(...valueTokenDiagnostics);

  // get duplicate token diagnostics
  const duplicateTokenDiagnostics = await getDuplicateTokenDiagnostics(
    tokens,
    textDocument,
    options
  );
  diagnostics.push(...duplicateTokenDiagnostics);

  return diagnostics;

  // In this simple example we get the settings for every validate run.
  // const settings = await getDocumentSettings(textDocument.uri, options);

  // The validator creates diagnostics for all uppercase words length 2 and more
  // const text = textDocument.getText();
  // const pattern = /\b[A-Z]{2,}\b/g;
  // let m: RegExpExecArray | null;

  // PREPARATORY
  // 1. Create an array of different types of diagnostics (e.g missing token, duplicate token, mismatched type, etc)

  // STEPS
  // 1. Read all the value tokens (i.e {!<VALUE_TOKEN>}) in the file

  // 2. Ensure that the value token exist in the hierarchy

  // 3. For each value token that does not exist in the hierarchy, create a missing token diagnostic

  // ensure that the value tokens exist

  // read all the tokens in the file (and their positions so to know where to place the squigglies)

  // for each of the token definition, ensure that the value token has the same type as the key token

  // ensure that there are no duplicate keys in the document. i.e two tokens with the same key name

  // ensure that token resolved values are not the same i.e duplicate token values

  // let problems = 0;
  // const diagnostics: Diagnostic[] = [];
  // while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
  //   problems++;
  //   const diagnostic: Diagnostic = {
  //     severity: DiagnosticSeverity.Warning,
  //     range: {
  //       start: textDocument.positionAt(m.index),
  //       // end: textDocument.positionAt(Number.MAX_VALUE),
  //       end: textDocument.positionAt(m.index + m[0].length),
  //     },
  //     message: `${m[0]} is all uppercase.`,
  //     source: "ex",
  //   };
  //   if (options?.hasDiagnosticRelatedInformationCapability) {
  //     diagnostic.relatedInformation = [
  //       {
  //         location: {
  //           uri: textDocument.uri,
  //           range: Object.assign({}, diagnostic.range),
  //         },
  //         message: "Spelling matters",
  //       },
  //       {
  //         location: {
  //           uri: textDocument.uri,
  //           range: Object.assign({}, diagnostic.range),
  //         },
  //         message: "Particularly for names",
  //       },
  //     ];
  //   }
  //   diagnostics.push(diagnostic);
  // }
  // return diagnostics;
};
