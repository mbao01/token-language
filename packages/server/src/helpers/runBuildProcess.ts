import { execSync } from "child_process";
import { getGlobalSettings } from "./getDocumentSettings";
import { connection } from "../server/connection";

export const runBuildProcess = async (callback: Function) => {
  const settings = getGlobalSettings();
  const buildCommand = settings?.build?.command;
  const cwd = settings?.tokens?.srcPackage;
  if (!(buildCommand && cwd)) return;

  connection.console.log(`🚧 Running build process: ${buildCommand} in ${cwd}`);

  try {
    const output = execSync(buildCommand, {
      cwd,
      encoding: "utf8",
      stdio: "pipe",
    });

    connection.console.log(
      `✅ Build process completed successfully: ${output}`
    );
    await callback();
  } catch (err: any) {
    connection.console.error(
      `❌ Build failed with exit code: ${err.status} - ${err.stderr}`
    );
  }
};
