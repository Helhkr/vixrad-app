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

export function convertMarkdownToHtml(md: string, opts?: { forceBlack?: boolean }): string {
  // Very small markdown subset: H1, bold, paragraphs, with inline styles for Word compatibility
  const forceBlack = opts?.forceBlack ?? false;
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  const blocks: string[] = [];
  let buffer: string[] = [];

  const baseStyle = forceBlack
    ? "font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.3; color: #000; background-color: transparent;"
    : "font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.3;";
  const blankLine = `<p style="margin: 0; ${baseStyle}">&nbsp;</p>`;

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    const text = buffer.join("\n");
    const withBold = text.replace(/\*\*(.*?)\*\*/g, (_m, t: string) => `<strong>${escapeHtml(t)}</strong>`);
    const withLineBreaks = withBold.replace(/\n/g, "<br />");
    blocks.push(`<p style="margin: 0 0 8px 0; ${baseStyle}">${withLineBreaks}</p>`);
    buffer = [];
  };

  for (const raw of lines) {
    const line = raw;
    if (/^#\s+/.test(line)) {
      flushParagraph();
      const title = line.replace(/^#\s+/, "");
      blocks.push(
        `<h1 style="margin: 0 0 12px 0; ${baseStyle} font-weight: bold; text-align: center;">${escapeHtml(title)}</h1>`,
      );
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }
    // Check if this line starts a new section (bold marker at line start)
    // Keep the extra blank paragraph for most sections, but skip it before "Indicação:".
    if (/^\*\*/.test(line) && blocks.length > 0 && !/^\*\*\s*Indicação\s*:/i.test(line)) {
      flushParagraph();
      blocks.push(blankLine);
    }
    const plain = escapeHtml(line);
    buffer.push(plain);
  }
  flushParagraph();

  // Wrap with a container enforcing Arial 12pt (and optionally force black text for copying)
  return `<div style="${baseStyle}">${blocks.join("\n")}</div>`;
}

export function formatReportForCopy(reportText: string, format: CopyFormat): string {
  switch (format) {
    case "formatted":
      return convertMarkdownToHtml(reportText, { forceBlack: true });
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
