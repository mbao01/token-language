type DiagnosticCode = "missing-token" | "invalid-token" | "mismatched-type" | "duplicate-token" | "duplicate-token-value" | "duplicate-token-definition";

export const getTokenDiagnosticsLink = (code: DiagnosticCode): string => {
  const diagnosticsUrl = `https://docs.ci.nutmeg.co.uk/nutkit/jpmx/latest/?path=/story/guidelines-tokens-diagnostics--${code}`;

  return diagnosticsUrl;
};
