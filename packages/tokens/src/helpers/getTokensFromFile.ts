import { type TokenNode } from "@/token";
import fs from "fs";

export const getTokensFromFile = (filepath: string) => {
  try {
    const data = fs.readFileSync(filepath, { encoding: "utf-8" });
    const tokens = JSON.parse(data);

    if (!tokens || !Array.isArray(tokens)) {
      throw new Error(
        `No tokens found in ${filepath}. Please ensure that is the right absolute file path to your tokens.`
      );
    }

    return tokens as TokenNode[];
  } catch (error) {
    console.error(
      `Failed to load token from ${filepath}: `,
      (error as Error)?.message
    );
  }
};
