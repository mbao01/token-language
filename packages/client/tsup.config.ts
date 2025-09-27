import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  outDir: "out",
  format: ["cjs"],
  bundle: true,
  sourcemap: true,
  splitting: true,
  noExternal: ["tokens-utilities"],
  external: ["vscode", "vscode-languageclient/node"],
  clean: true,
});
