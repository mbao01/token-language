import { TokenNode } from "@/token";

export const getHierarchyKeys = ({
  platform,
  buildName,
  mode,
  theme,
  src,
}: TokenNode): string[] => {
  const _buildName = buildName.replace("-", "_");
  const keys = src.includes("all-platforms")
    ? [[_buildName], [_buildName, theme === "default" ? undefined : theme]]
    : [
        [
          platform,
          buildName.replace("-", "_"),
          theme === "default" ? undefined : theme,
          mode,
        ],
      ];

  return keys.map((key) => key.filter(Boolean).join("_").toUpperCase());
};
