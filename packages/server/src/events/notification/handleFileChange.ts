import {
  DidChangeWatchedFilesParams,
  NotificationHandler,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";
import { getGlobalSettings } from "../../helpers/getDocumentSettings";
import { runBuildProcess } from "../../helpers/runBuildProcess";
import { CAPABILITIES } from "../../server/capabilities";
import { validateTextDocument } from "../../helpers/validateDocument";
import { documents } from "../../server/documents";

let buildTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 1500;

export const handleFileChange: NotificationHandler<
  DidChangeWatchedFilesParams
> = async (_change) => {
  const changedFiles = _change.changes.map((c) => c.uri);
  connection.console.log(
    `📁 File Changed: handleFileChange: start\n${changedFiles.join("\n")}`
  );

  if (buildTimer) clearTimeout(buildTimer);

  buildTimer = setTimeout(async () => {
    await runBuildProcess(() =>
      Promise.allSettled(
        _change.changes
          .map((c) => {
            const doc = documents.get(c.uri);
            if (!doc) return;
            return validateTextDocument(doc, CAPABILITIES);
          })
          .filter(Boolean)
      )
    );
    buildTimer = null;
  }, DEBOUNCE_DELAY);

  // Monitored files have change in VSCode
  connection.console.log("We received a file change event");
  const settings = getGlobalSettings();
  if (!settings.tokens.srcPackage) return;

  // TODO:: Rebuild tokens here, and debounce this event
  connection.console.log("📁 File Changed: handleFileChange: end");
};
