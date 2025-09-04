import {
  DiagnosticServerCancellationData,
  DocumentDiagnosticParams,
  DocumentDiagnosticReport,
  DocumentDiagnosticReportKind,
  DocumentDiagnosticReportPartialResult,
  ServerRequestHandler,
} from "vscode-languageserver/node";
import { documents } from "../../server/documents";
import { validateTextDocument } from "../../helpers/validateDocument";
import { CAPABILITIES } from "../../server/capabilities";

export const handleDiagnostics: ServerRequestHandler<
  DocumentDiagnosticParams,
  DocumentDiagnosticReport,
  DocumentDiagnosticReportPartialResult,
  DiagnosticServerCancellationData
> = async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (document !== undefined) {
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: await validateTextDocument(document, CAPABILITIES),
    } satisfies DocumentDiagnosticReport;
  } else {
    // We don't know the document. We can either try to read it from disk
    // or we don't report problems for it.
    return {
      kind: DocumentDiagnosticReportKind.Full,
      items: [],
    } satisfies DocumentDiagnosticReport;
  }
};
