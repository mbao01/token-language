export const hasColorValue = (color: string | number) => {
  if (typeof color !== "string") return false;
  // TODO update checks to handle relative css syntax
  if (color.startsWith("rgb(from")) return false;
  if (color.startsWith("#") || color.startsWith("rgb")) {
    return true;
  }

  return false;
};
