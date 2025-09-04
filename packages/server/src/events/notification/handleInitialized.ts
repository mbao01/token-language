import {
  DidChangeConfigurationNotification,
  InitializedParams,
  NotificationHandler,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";
import { CAPABILITIES } from "../../server/capabilities";

export const handleInitialized: NotificationHandler<InitializedParams> = () => {
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
};
