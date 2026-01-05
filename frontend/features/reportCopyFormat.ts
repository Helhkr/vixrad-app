export type CopyFormat = "formatted" | "plain" | "markdown";

export function convertMarkdownToFormattedText(md: string): string {
  return md
    .replace(/^# (.*$)/gm, (_, title: string) => title.toUpperCase())
    .replace(/\*\*(.*?)\*\*/g, (_, text: string) => text.toUpperCase())
    .replace(/^\s*-\s*/gm, "")
    .replace(/\n{2,}/g, "\n\n");
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/^# (.*$)/gm, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*-\s*/gm, "")
    .replace(/\n{2,}/g, "\n\n");
}

export function formatReportForCopy(reportText: string, format: CopyFormat): string {
  switch (format) {
    case "formatted":
      return convertMarkdownToFormattedText(reportText);
    case "plain":
      return stripMarkdown(reportText);
    case "markdown":
      return reportText;
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}
