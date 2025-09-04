import {
  Hover,
  HoverParams,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { documents } from "../../server/documents";
import { getTokenAtPosition } from "../../helpers/token";

export const handleHover: ServerRequestHandler<
  HoverParams,
  Hover | undefined | null,
  never,
  void
> = (params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return;

  const token = getTokenAtPosition(doc, params.position);
  if (!token) return;

  // Example: lookup token value
  const value = token; // tokens is your shared/global token object
  // const value = tokens[word]; // tokens is your shared/global token object
  if (!value) return;

  return {
    contents: {
      kind: "markdown",
      value: `**${token}**: ${value}`,
    },
  };
};
