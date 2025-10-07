import type { CapabilitiesOptions, TokenLanguageSettings } from "./types";
import { connection } from "../server/connection";

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.

let globalSettings: TokenLanguageSettings | undefined;

// Cache the settings of all open documents
const documentSettings = new Map<string, Thenable<TokenLanguageSettings>>();

export const getDocumentSettings = (
  resource: string,
  options?: CapabilitiesOptions,
  shouldUseGlobalSettings: boolean = true
): Thenable<TokenLanguageSettings | undefined> => {
  if (shouldUseGlobalSettings || !options?.hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "tokenLanguage",
    });
    documentSettings.set(resource, result);
  }
  return result;
};

export const setGlobalSettings = async () => {
  const settings = await connection.workspace.getConfiguration({
    section: "tokenLanguage",
  });
  globalSettings = settings;
};

export const deleteDocumentSettings = (resource: string) => {
  documentSettings.delete(resource);
};
