import fs from "fs";
import path from "path";

const storageFile = path.join(process.cwd(), ".lsp-storage.json");

const save = (data: object) => {
  fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
};

const load = (): object | null => {
  if (!fs.existsSync(storageFile)) return null;
  return JSON.parse(fs.readFileSync(storageFile, "utf-8"));
};

export const storage = {
  save,
  load,
};
