import { type TokenGraph } from "../../../../types/token";

export const renderDependencyGraph = (
  title: string,
  graph: TokenGraph
): string => {
  const seen = new Set<string>();
  const lines: string[] = [`#### ${title}`, ``, "```markdown"];

  function dfs(node: TokenGraph, prefix: string = "", isLast: boolean = true) {
    const connector = prefix ? (isLast ? "└── " : "├── ") : "";
    lines.push(prefix + connector + node.name);

    if (seen.has(node.name)) return;
    seen.add(node.name);

    const children = node.children || [];
    const newPrefix = prefix + (isLast ? "   " : "│  ");

    children.forEach((child, index) => {
      const last = index === children.length - 1;
      dfs(child, newPrefix, last);
    });
  }

  dfs(graph);

  lines.push("```");

  return lines.join("\n");
};
