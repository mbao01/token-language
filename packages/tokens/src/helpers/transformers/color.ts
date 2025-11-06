const expandHexValue = (hexValue: string) => {
  return hexValue.length < 6
    ? hexValue.replaceAll(/./g, (c) => c + c)
    : hexValue;
};

// From https://developer.mozilla.org/en-US/docs/Web/CSS/color
const NATIVE_STRINGS = [
  /* Keyword values */
  "currentcolor",
  /* Global values */
  "inherit",
  "initial",
  "revert",
  "revert-layer",
  "unset",
];

const colorParts = (
  color: string,
  name?: string
): [number, number, number, number] | string => {
  if (color === "") return color;
  if (NATIVE_STRINGS.includes(color)) return color;
  if (color === "transparent") return [0, 0, 0, 0];

  if (color.startsWith("rgb(")) {
    color.replace(/^rgb\((.+)\)$/, "$1");
    const [r, g, b] = color
      .slice(4, -1)
      .split(/[\s/,]+/g)
      .map((c) => parseInt(c.trim()));

    return [r, g, b, 1];
  }

  if (color.startsWith("#")) {
    // hex color
    const [r, g, b, a = 255] = expandHexValue(color.slice(1))
      .match(/../g)!
      .map((c: string) => parseInt(c, 16));

    return [r, g, b, a / 255];
  }

  // color space
  const [, colorSpace, colorDefinition] = color.match(/^(\w+)\((.+)\)$/) as any;

  // rgba color
  if (["ALPHA"].includes(colorSpace)) {
    let r, g, b, a;

    if (!colorDefinition.match(/^\d/)) {
      // nested definition
      const alpha = colorDefinition
        .match(/[)\s,/]+[^\s,/]+$/g)[0]
        .replace(/^\)/g, "");

      [r, g, b] = colorParts(colorDefinition.replaceAll(alpha, ""));
      a = alpha.replaceAll(/[)\s,/]+/g, "");
    } else {
      [r, g, b, a = 1] = colorDefinition.split(/[\s/,]+/g);
    }

    const normalizedAlpha = parseFloat(a) / (`${a}`.endsWith("%") ? 100 : 1);

    return [r, g, b, normalizedAlpha];
  }

  // hls or others ...

  // invalid color input
  return "Invalid color";
};

const alphaToCSS = (alpha: number) => {
  return Math.round(alpha * 100) / 100;
};

export const colorToFnRGBA = (color: string, name?: string) => {
  const parts = colorParts(color, name);

  if (!Array.isArray(parts)) return parts;

  const [r, g, b, a] = parts;

  return a === 1
    ? `rgb(${[r, g, b].join(", ")})`
    : `rgba(${[r, g, b].join(", ")}, ${alphaToCSS(a)})`;
};

export const colorToRawRGB = (color: string, name?: string) => {
  const parts = colorParts(color, name);

  if (!Array.isArray(parts)) return parts;

  const [r, g, b] = parts;

  return `${[r, g, b].join(", ")}`;
};

export const colorToHexRGBA = (color: string, name?: string) => {
  const parts = colorParts(color, name);

  if (!Array.isArray(parts)) return parts;

  parts[3] *= 255;
  const [r, g, b, a] = parts;

  return `#${[r, g, b, a]
    .map((c) => Math.round(Number(c)).toString(16).padStart(2, "0"))
    .join("")}`;
};

export const colorToHexARGB = (color: string, name?: string) => {
  const parts = colorParts(color, name);

  if (!Array.isArray(parts)) return parts;

  parts[3] *= 255;
  const [r, g, b, a] = parts;

  return `#${[a, r, g, b]
    .map((c) => Math.round(Number(c)).toString(16).padStart(2, "0"))
    .join("")}`;
};
