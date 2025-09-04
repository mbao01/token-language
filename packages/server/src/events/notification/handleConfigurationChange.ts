import {
  DidChangeConfigurationParams,
  NotificationHandler,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";
import { setGlobalSettings } from "../../helpers/getDocumentSettings";

export const handleConfigurationChange: NotificationHandler<
  DidChangeConfigurationParams
> = (change) => {
  connection.console.log("⚙️ Configuration changed");

  setGlobalSettings(change.settings?.tokenLanguage);

  // Refresh the diagnostics since the `maxNumberOfProblems` could have changed.
  // We could optimize things here and re-fetch the setting first can compare it
  // to the existing setting, but this is out of scope for this example.
  connection.languages.diagnostics.refresh();
};
