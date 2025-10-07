export type CapabilitiesOptions = {
  hasConfigurationCapability?: boolean;
  hasDiagnosticRelatedInformationCapability?: boolean;
};

type JSONFile = `${string}.json`;
type TokenPackagePath = string;

export type TokenLanguageSettings = {
  maxNumberOfProblems: number;
  build?: {
    command: string;
  };
  tokens: {
    json: JSONFile;
    srcPackage: TokenPackagePath;
    matchers?: RegExp[];
  };
  trace?: {
    server: "off" | "messages" | "verbose";
  };
};
