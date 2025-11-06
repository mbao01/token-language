import { hasColorValue } from "./hasColorValue";

export const getColorMarkdown = (color: string) => {
  if (!hasColorValue(color)) return color;

  const svg = `<svg width="0.5rem" height="0.5rem" xmlns="http://www.w3.org/2000/svg"><rect width="0.5rem" height="0.5rem" fill="${color}" /></svg>`;
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const markdown = `![color](${dataUrl}) \`${color}\``;

  return markdown;
};
