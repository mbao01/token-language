import path from "path";
import { Diagnostic } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getGlobalSettings } from "./getDocumentSettings";
import type { CapabilitiesOptions } from "./types";
import { getValueTokenDiagnostics } from "./diagnostics/getValueTokenDiagnostics";
import { loadTokensFromFile } from "tokens-utilities/helpers";
import {
  getAliasTokenDiagnostics,
  getDuplicateTokenDiagnostics,
  getInvalidTokenDiagnostics,
} from "./diagnostics";
import { connection } from "../server/connection";

export const validateTextDocument = async (
  textDocument: TextDocument,
  options?: CapabilitiesOptions
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  const settings = getGlobalSettings();
  if (!(settings.tokens?.srcPackage && settings.tokens?.json)) {
    return diagnostics;
  }

  if (
    !textDocument.uri.includes(path.join(settings.tokens.srcPackage, "src"))
  ) {
    return diagnostics;
  }

  connection.console.log(`Validating document: ${textDocument.uri}`);

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

  // get alias token diagnostics
  const aliasTokenDiagnostics = await getAliasTokenDiagnostics(
    tokens,
    textDocument,
    options
  );
  diagnostics.push(...aliasTokenDiagnostics);

  // invalid token diagnostics
  const invalidTokenDiagnostics = await getInvalidTokenDiagnostics(
    textDocument,
    options
  );
  diagnostics.push(...invalidTokenDiagnostics);

  return diagnostics;

  // PREPARATORY
  // 1. Create an array of different types of diagnostics (e.g semantic diagnostics (missing token, duplicate token ✅, mismatched alias/token type, unused aliases✅), syntax diagnostics, etc)

  // STEPS
  // 1. Read all the value tokens (i.e {!<VALUE_TOKEN>}) in the file

  // 2. Ensure that the value token exist in the hierarchy

  // 3. For each value token that does not exist in the hierarchy, create a missing token diagnostic

  // ensure that the value tokens exist

  // read all the tokens in the file (and their positions so to know where to place the squigglies)

  // for each of the token definition, ensure that the value token has the same type as the key token

  // ensure that there are no duplicate keys in the document. i.e two tokens with the same key name

  // ensure that token resolved values are not the same i.e duplicate token values
};
