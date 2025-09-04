export type CapabilitiesOptions = {
  hasConfigurationCapability?: boolean;
  hasDiagnosticRelatedInformationCapability?: boolean;
};

export type TokenLanguageSettings = {
  maxNumberOfProblems: number;
  tokens: {
    srcDir: string[];
    outDir: string[];
    watchCommand: string;
    matchers: RegExp[];
  };
};
