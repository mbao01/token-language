export class Markdown {
  markdown: string;

  constructor() {
    this.markdown = "";
  }

  toString() {
    return this.markdown;
  }

  header(content: string, level: 1 | 2 | 3 | 4 | 5 | 6): void {
    this.next(`${"#".repeat(level)} ${content}`);
  }

  break(): void {
    this.next("<br />");
  }

  divider(): void {
    this.next(`---`);
  }

  /**
   * Appends content to the markdown.
   * @param content The markdown content to append.
   */
  next(content: string): void {
    this.markdown += [content, " ", " "].filter(Boolean).join("\n");
  }

  /**
   * Generates a markdown table from headers and rows.
   * @param headers An array of header strings.
   * @param rows An array of rows, each row being an array of string values.
   * @returns A string representing the markdown table.
   */
  table<K extends string>(
    headers: (K | { label: string; key: K })[],
    rows: Record<K, string>[],
    { title, caption }: { title?: string; caption?: string } = {}
  ): void {
    const headerLabels = headers.map((h) =>
      typeof h === "string" ? h : h.label
    );
    const headerKeys = headers.map((h) => (typeof h === "string" ? h : h.key));
    const headerRow = `| ${headerLabels.join(" | ")} |`;
    const separatorRow = `| ${headerLabels
      .map(() => ":----------")
      .join(" | ")} |`;
    const contentRows = rows
      .map((row) => `| ${headerKeys.map((h) => row[h] ?? "-").join(" | ")} |`)
      .join("\n");

    const content = [title, " ", headerRow, separatorRow, contentRows, caption]
      .filter(Boolean)
      .join("\n");

    this.next(content);
  }
}
