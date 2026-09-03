export type PdfImageFormat = "jpeg" | "png";

export function pdfBaseName(filename: string): string {
  const trimmed = filename.trim();
  const withoutExt = trimmed.replace(/\.pdf$/i, "");
  return withoutExt.length > 0 ? withoutExt : "document";
}

export function pageImageFileName(pdfName: string, pageNumber: number, totalPages: number, format: PdfImageFormat): string {
  const base = pdfBaseName(pdfName);
  const ext = format === "png" ? "png" : "jpg";
  if (totalPages <= 1) return `${base}.${ext}`;
  const pad = String(totalPages).length;
  return `${base}-page-${String(pageNumber).padStart(pad, "0")}.${ext}`;
}

export function pagesZipFileName(pdfName: string): string {
  return `${pdfBaseName(pdfName)}-pages.zip`;
}
