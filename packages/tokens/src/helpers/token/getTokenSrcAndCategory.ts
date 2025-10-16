import path from "path";

export function getTokenSrcAndCategory(filePath: string) {
  const category = path
    .basename(filePath, path.extname(filePath))
    .toLowerCase();
  const absoluteSrc = path.dirname(filePath).toLowerCase();

  return {
    category,
    absoluteSrc,
  };
}
