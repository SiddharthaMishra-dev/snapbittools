import { PDFDocument } from "pdf-lib";

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function pdfBaseName(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, "").trim();
  return base || "document";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function friendlyPdfError(err: unknown, fallback = "This PDF could not be read. It may be encrypted or corrupted."): Error {
  if (err instanceof DOMException && err.name === "AbortError") return err;

  const name = err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "";
  const message = err instanceof Error ? err.message : String(err);

  if (name === "PasswordException" || name === "EncryptedPDFError" || /password|encrypted/i.test(message)) {
    return new Error("This PDF is password-protected. Remove the password and try again.");
  }
  if (name === "InvalidPDFException" || /invalid pdf|failed to parse pdf/i.test(message)) {
    return new Error("This file doesn’t look like a valid PDF.");
  }

  return new Error(fallback);
}

function tightBytes(bytes: Uint8Array): Uint8Array {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

async function loadPdf(data: ArrayBuffer): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(data.slice(0));
  } catch (err) {
    throw friendlyPdfError(err);
  }
}

function pageIndexes(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

async function copyIntoNewPdf(source: PDFDocument, indexes: number[]): Promise<Uint8Array> {
  const next = await PDFDocument.create();
  const pages = await next.copyPages(source, indexes);
  for (const page of pages) next.addPage(page);
  return tightBytes(await next.save());
}

async function yieldToUi() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export async function readPdfPageCount(data: ArrayBuffer): Promise<number> {
  const doc = await loadPdf(data);
  return doc.getPageCount();
}

export async function mergePdfBuffers(buffers: ArrayBuffer[], onProgress?: (current: number, total: number) => void): Promise<Uint8Array> {
  if (buffers.length < 2) {
    throw new Error("Add at least two PDFs to merge.");
  }

  const merged = await PDFDocument.create();

  for (let index = 0; index < buffers.length; index++) {
    const source = await loadPdf(buffers[index]);
    const count = source.getPageCount();
    if (count > 0) {
      const pages = await merged.copyPages(source, pageIndexes(count));
      for (const page of pages) merged.addPage(page);
    }
    onProgress?.(index + 1, buffers.length);
    await yieldToUi();
  }

  if (merged.getPageCount() < 1) {
    throw new Error("These PDFs have no pages to merge.");
  }

  return tightBytes(await merged.save());
}

export async function splitPdfIntoPages(data: ArrayBuffer, onProgress?: (current: number, total: number) => void): Promise<Uint8Array[]> {
  const source = await loadPdf(data);
  const count = source.getPageCount();
  if (count < 2) {
    throw new Error("This PDF has only one page, so there is nothing to split.");
  }

  const parts: Uint8Array[] = [];
  for (let index = 0; index < count; index++) {
    parts.push(await copyIntoNewPdf(source, [index]));
    onProgress?.(index + 1, count);
    await yieldToUi();
  }
  return parts;
}

/** `afterPage` is the last 1-based page that stays in the first PDF. */
export async function splitPdfAt(data: ArrayBuffer, afterPage: number): Promise<[Uint8Array, Uint8Array]> {
  const source = await loadPdf(data);
  const count = source.getPageCount();
  if (count < 2) {
    throw new Error("This PDF has only one page, so there is nothing to split.");
  }
  if (!Number.isInteger(afterPage) || afterPage < 1 || afterPage >= count) {
    throw new Error(`Split after a page from 1 to ${count - 1}.`);
  }

  const first = await copyIntoNewPdf(source, pageIndexes(afterPage));
  const second = await copyIntoNewPdf(
    source,
    Array.from({ length: count - afterPage }, (_, index) => index + afterPage),
  );
  return [first, second];
}

/** `pageIndexes` are 0-based indexes into the original PDF, in the desired order. */
export async function rebuildPdfPages(data: ArrayBuffer, indexes: number[]): Promise<Uint8Array> {
  if (indexes.length < 1) {
    throw new Error("Keep at least one page.");
  }

  const source = await loadPdf(data);
  const count = source.getPageCount();
  if (indexes.some((index) => !Number.isInteger(index) || index < 0 || index >= count)) {
    throw new Error("One of the selected pages is missing from this PDF.");
  }

  return copyIntoNewPdf(source, indexes);
}

export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
