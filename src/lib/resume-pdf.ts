// Browser-only PDF export of the optimized resume (selectable text, single column).

const REPLACEMENTS: [RegExp, string][] = [
  [/[\u2018\u2019\u201A\u2032]/g, "'"],
  [/[\u201C\u201D\u201E\u2033]/g, '"'],
  [/[\u2013\u2014\u2212]/g, "-"],
  [/\u2026/g, "..."],
  [/[\u2022\u25AA\u25CF\u25E6\u2023]/g, "-"],
  [/[\u00A0\u2007\u202F]/g, " "],
  [/\t/g, "  "],
];

/** Keeps characters the standard PDF fonts can render (Latin-1 covers Portuguese). */
export function sanitizeForPdf(text: string): string {
  let out = text.normalize("NFC");
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  // eslint-disable-next-line no-control-regex
  return out.replace(/[^\n\u0020-\u007E\u00A1-\u00FF]/g, "");
}

function isHeading(line: string): boolean {
  const t = line.trim();
  if (t.length < 3 || t.length > 60) return false;
  if (/^[-*•]/.test(t)) return false;
  if (!/[A-ZÀ-Ý]/.test(t)) return false;
  return t === t.toLocaleUpperCase("pt-BR") && !/[a-zà-ÿ]/.test(t);
}

const BULLET_RE = /^\s*[-*•]\s+/;

export async function downloadResumePdf(text: string, filename = "curriculo-otimizado.pdf") {
  const content = sanitizeForPdf(text).replace(/\r\n?/g, "\n").trim();
  if (!content) throw new Error("O currículo está vazio.");

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.setProperties({ title: "Currículo", creator: "CurrículoMatch" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (
    str: string,
    opts: { size: number; bold?: boolean; color?: [number, number, number]; indent?: number; lh?: number },
  ) => {
    const indent = opts.indent ?? 0;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size);
    doc.setTextColor(...(opts.color ?? [33, 37, 41]));
    const lh = opts.lh ?? opts.size * 1.38;
    const wrapped = doc.splitTextToSize(str, maxW - indent) as string[];
    for (const w of wrapped) {
      ensureSpace(lh);
      doc.text(w, margin + indent, y + opts.size);
      y += lh;
    }
  };

  const lines = content.split("\n");
  let i = 0;
  // Name
  const at = (n: number) => lines[n] ?? "";
  while (i < lines.length && !at(i).trim()) i++;
  if (i < lines.length) {
    write(at(i).trim(), { size: 18, bold: true, color: [23, 59, 87], lh: 24 });
    i++;
  }
  // Contact lines until blank line or heading
  while (i < lines.length && at(i).trim() && !isHeading(at(i))) {
    write(at(i).trim(), { size: 10, color: [85, 95, 110] });
    i++;
  }
  y += 6;

  for (; i < lines.length; i++) {
    const raw = at(i);
    const line = raw.trim();
    if (!line) {
      y += 5;
      continue;
    }
    if (isHeading(line)) {
      ensureSpace(34);
      y += 8;
      write(line, { size: 11.5, bold: true, color: [23, 59, 87], lh: 15 });
      doc.setDrawColor(32, 164, 122);
      doc.setLineWidth(0.8);
      doc.line(margin, y + 1, pageW - margin, y + 1);
      y += 8;
      continue;
    }
    if (BULLET_RE.test(raw)) {
      const body = raw.replace(BULLET_RE, "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const wrapped = doc.splitTextToSize(body, maxW - 14) as string[];
      wrapped.forEach((w, idx) => {
        ensureSpace(14.5);
        doc.setTextColor(33, 37, 41);
        if (idx === 0) doc.text("-", margin + 3, y + 10.5);
        doc.text(w, margin + 14, y + 10.5);
        y += 14.5;
      });
      continue;
    }
    const isRoleLine = line.includes(" | ");
    write(line, { size: 10.5, bold: isRoleLine, lh: 14.5 });
  }

  doc.save(filename);
}
