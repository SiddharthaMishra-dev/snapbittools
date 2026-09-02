import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

import { pageImageFileName, type PdfImageFormat } from "./pdfToImagesNames";

export { pageImageFileName, pagesZipFileName, pdfBaseName, type PdfImageFormat } from "./pdfToImagesNames";

GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export type PdfToImageDpiPreset = "web" | "screen" | "print";

export type PdfToImagesOptions = {
  pdfData: ArrayBuffer;
  format: PdfImageFormat;
  /** JPEG quality 0.4–0.95. Ignored for PNG. */
  quality: number;
  /** Render DPI (72–300 typical). PDF points are 72 DPI. */
  dpi: number;
  signal?: AbortSignal;
  onProgress?: (currentPage: number, totalPages: number) => void;
};

export type PdfPageImage = {
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
};

export type PdfToImagesResult = {
  pages: PdfPageImage[];
  pageCount: number;
};

export const PDF_TO_IMAGE_DPI_PRESETS: Record<PdfToImageDpiPreset, { label: string; description: string; dpi: number }> = {
  web: {
    label: "Web",
    description: "Smaller files — email, chat, quick previews",
    dpi: 72,
  },
  screen: {
    label: "Screen",
    description: "Sharp on displays without huge files",
    dpi: 150,
  },
  print: {
    label: "Print",
    description: "Highest detail — larger downloads",
    dpi: 300,
  },
};

const MAX_CANVAS_EDGE = 4096;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled", "AbortError");
  }
}

function friendlyPdfError(err: unknown): Error {
  if (err instanceof DOMException && err.name === "AbortError") {
    return err;
  }

  const name = err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "";
  const message = err instanceof Error ? err.message : String(err);

  if (name === "PasswordException" || /password/i.test(message)) {
    return new Error("This PDF is password-protected. Remove the password and try again.");
  }
  if (name === "InvalidPDFException" || /invalid pdf/i.test(message)) {
    return new Error("This file doesn’t look like a valid PDF.");
  }

  return err instanceof Error ? err : new Error("Failed to convert PDF. The file may be encrypted or corrupted.");
}

function canvasToBlob(canvas: HTMLCanvasElement, format: PdfImageFormat, quality: number): Promise<Blob> {
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const qualityArg = format === "jpeg" ? quality : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to encode page as ${format === "png" ? "PNG" : "JPEG"}`));
          return;
        }
        resolve(blob);
      },
      mime,
      qualityArg,
    );
  });
}

/**
 * Rasterize PDF pages to JPEG or PNG entirely in the browser.
 * Pages are drawn on a white canvas so JPEG output matches on-screen PDF viewing.
 */
export async function convertPdfToImages(options: PdfToImagesOptions, sourceFileName = "document.pdf"): Promise<PdfToImagesResult> {
  const quality = clamp(options.quality, 0.4, 0.95);
  const dpi = clamp(options.dpi, 54, 300);
  const scale = dpi / 72;

  throwIfAborted(options.signal);

  const dataCopy = options.pdfData.slice(0);

  try {
    const loadingTask = getDocument({
      data: dataCopy,
      useSystemFonts: true,
      disableFontFace: false,
    });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    if (pageCount < 1) {
      throw new Error("This PDF has no pages to convert.");
    }

    const pages: PdfPageImage[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      throwIfAborted(options.signal);

      const page = await pdf.getPage(pageNum);
      const unclamped = page.getViewport({ scale });
      const clampRatio = Math.min(1, MAX_CANVAS_EDGE / Math.max(unclamped.width, unclamped.height));
      const viewport = clampRatio < 1 ? page.getViewport({ scale: scale * clampRatio }) : unclamped;

      const width = Math.max(1, Math.floor(viewport.width));
      const height = Math.max(1, Math.floor(viewport.height));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: options.format === "png" });
      if (!ctx) {
        throw new Error("Canvas is not available in this browser.");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      }).promise;

      throwIfAborted(options.signal);

      const blob = await canvasToBlob(canvas, options.format, quality);

      canvas.width = 0;
      canvas.height = 0;

      pages.push({
        pageNumber: pageNum,
        blob,
        width,
        height,
        fileName: pageImageFileName(sourceFileName, pageNum, pageCount, options.format),
      });

      options.onProgress?.(pageNum, pageCount);
      await new Promise((r) => setTimeout(r, 0));
    }

    return { pages, pageCount };
  } catch (err) {
    throw friendlyPdfError(err);
  }
}
