import {
  DidChangeConfigurationNotification,
  InitializedParams,
  NotificationHandler,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";
import { CAPABILITIES } from "../../server/capabilities";
import { setGlobalSettings } from "../../helpers/getDocumentSettings";

export const handleInitialized: NotificationHandler<InitializedParams> = async () => {
  connection.console.log('🚀 Server Initialized: handleInitialized: start');
  if (CAPABILITIES.hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (CAPABILITIES.hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }

  await setGlobalSettings();
  connection.console.log('🚀 Server Initialized: handleInitialized: end');
};
