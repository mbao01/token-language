import {
  DidChangeWatchedFilesParams,
  NotificationHandler,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";

export const handleFileChange: NotificationHandler<
  DidChangeWatchedFilesParams
> = (_change) => {
  connection.console.log('📁 File Changed: handleFileChange: start');
  // Monitored files have change in VSCode
  connection.console.log("We received a file change event");
  connection.console.log('📁 File Changed: handleFileChange: end');
};
