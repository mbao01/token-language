import {
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  CompletionParams,
  RequestHandler,
  ServerRequestHandler,
  TextDocumentPositionParams,
} from "vscode-languageserver/node";
import { connection } from "../../server/connection";

/**
 * This handler provides the initial list of the completion items.
 * @param _textDocumentPosition
 * @returns
 */
export const handleCompletion: ServerRequestHandler<
  CompletionParams,
  CompletionItem[] | CompletionList | undefined | null,
  CompletionItem[],
  void
> = (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
  connection.console.log('💡 Completion Requested: handleCompletion: start');
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  const result: CompletionItem[] = [
    {
      label: "TypeScript",
      kind: CompletionItemKind.Text,
      data: 1,
    },
    {
      label: "JavaScript",
      kind: CompletionItemKind.Text,
      data: 2,
    },
  ];
  connection.console.log('💡 Completion Requested: handleCompletion: end');
  return result;
};

/**
 * This handler resolves additional information for the item selected in
 * the completion list.
 * @param item
 * @returns
 */
export const handleCompletionResolve: RequestHandler<
  CompletionItem,
  CompletionItem,
  void
> = (item: CompletionItem): CompletionItem => {
  connection.console.log('💡 Completion Resolving: handleCompletionResolve: start');
  if (item.data === 1) {
    item.detail = "TypeScript details";
    item.documentation = "TypeScript documentation";
  } else if (item.data === 2) {
    item.detail = "JavaScript details";
    item.documentation = "JavaScript documentation";
  }
  connection.console.log('💡 Completion Resolving: handleCompletionResolve: end');
  return item;
};
