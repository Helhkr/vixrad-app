export type CopyFormat = "formatted" | "plain" | "markdown";

export function convertMarkdownToFormattedText(md: string): string {
  // Convert to simple HTML preserving bold and headings; then flatten to readable text
  const html = convertMarkdownToHtml(md);
  return html
    .replace(/<h1>(.*?)<\/h1>/g, (_, title: string) => `\n${title}\n`)
    .replace(/<p>(.*?)<\/p>/g, (_, text: string) => `${text}\n`)
    .trim();
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/^# (.*$)/gm, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*-\s*/gm, "")
    .replace(/\n{2,}/g, "\n\n");
}

export function convertMarkdownToHtml(md: string): string {
  // Very small markdown subset: H1, bold, paragraphs, with inline styles for Word compatibility
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  const blocks: string[] = [];
  let buffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    // Join with explicit newlines so we can preserve them as <br/>
    const text = buffer.join("\n");
    const withBold = text.replace(/\*\*(.*?)\*\*/g, (_m, t: string) => `<strong>${escapeHtml(t)}</strong>`);
    const withLineBreaks = withBold.replace(/\n/g, "<br />");
    blocks.push(`<p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3;">${withLineBreaks}</p>`);
    buffer = [];
  };

  for (const raw of lines) {
    const line = raw;
    if (/^#\s+/.test(line)) {
      flushParagraph();
      const title = line.replace(/^#\s+/, "");
      blocks.push(
        `<h1 style="margin: 0 0 12px 0; font-family: Arial, sans-serif; font-size: 10pt; font-weight: bold; line-height: 1.3;">${escapeHtml(title)}</h1>`,
      );
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }
    const plain = escapeHtml(line);
    buffer.push(plain);
  }
  flushParagraph();

  // Wrap with a container enforcing Arial 10pt
  return `<div style="font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3;">${blocks.join("\n")}</div>`;
}

export function formatReportForCopy(reportText: string, format: CopyFormat): string {
  switch (format) {
    case "formatted":
      return convertMarkdownToHtml(reportText);
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
