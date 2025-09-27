import path from "path";

export function getFilenameAndExtension(filePath: string) {
  return {
    filename: path.basename(filePath, path.extname(filePath)), // name without extension
    extension: path.extname(filePath), // includes the dot (e.g. ".txt")
  };
}
