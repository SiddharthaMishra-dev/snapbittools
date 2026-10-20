import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { friendlyPdfError, mergePdfBuffers, readPdfPageCount, rebuildPdfPages, splitPdfAt, splitPdfIntoPages } from "./pdfPages";

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function makePdf(widths: number[]): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (const width of widths) {
    doc.addPage([width, 400]);
  }
  return asArrayBuffer(await doc.save());
}

async function pageWidths(bytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((page) => page.getWidth());
}

describe("pdf page tools", () => {
  it("merges PDFs in the given order and keeps every page", async () => {
    const first = await makePdf([120, 140]);
    const second = await makePdf([200]);
    const merged = await mergePdfBuffers([second, first]);

    expect(await pageWidths(merged)).toEqual([200, 120, 140]);
    expect(await readPdfPageCount(asArrayBuffer(merged))).toBe(3);
  });

  it("splits each page into its own PDF", async () => {
    const source = await makePdf([101, 202, 303]);
    const parts = await splitPdfIntoPages(source);

    expect(parts).toHaveLength(3);
    expect(await pageWidths(parts[0])).toEqual([101]);
    expect(await pageWidths(parts[1])).toEqual([202]);
    expect(await pageWidths(parts[2])).toEqual([303]);
  });

  it("splits a PDF into two documents after a chosen page", async () => {
    const source = await makePdf([101, 202, 303]);
    const [first, second] = await splitPdfAt(source, 1);

    expect(await pageWidths(first)).toEqual([101]);
    expect(await pageWidths(second)).toEqual([202, 303]);
  });

  it("rebuilds a PDF with pages reordered and removed", async () => {
    const source = await makePdf([101, 202, 303, 404]);
    const next = await rebuildPdfPages(source, [3, 0]);

    expect(await pageWidths(next)).toEqual([404, 101]);
  });

  it("rejects a one-page split, a junk file, and an encrypted PDF error", async () => {
    await expect(splitPdfIntoPages(await makePdf([100]))).rejects.toThrow(/nothing to split/);

    const junk = new Uint8Array([1, 2, 3, 4]).buffer;
    await expect(readPdfPageCount(junk)).rejects.toThrow(/valid PDF/);

    expect(friendlyPdfError(new Error("Input document to `PDFDocument.load` is encrypted.")).message).toMatch(/password-protected/);
  });
});
