import { PDFDocument } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// pdf.js worker (runs alongside the page; compression itself is async per page)
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export type PdfCompressPreset = "strong" | "balanced" | "high";

export type PdfCompressOptions = {
  /** Raw PDF bytes (will be copied — original buffer is not detached). */
  pdfData: ArrayBuffer;
  /** JPEG quality 0.4–0.95 */
  quality: number;
  /** Render DPI (72–150 typical). PDF points are 72 DPI. */
  dpi: number;
  onProgress?: (currentPage: number, totalPages: number) => void;
};

export type PdfCompressResult = {
  blob: Blob;
  pageCount: number;
  outputSize: number;
  usedOriginal: boolean;
};

export const PDF_COMPRESS_PRESETS: Record<
  PdfCompressPreset,
  { label: string; description: string; quality: number; dpi: number }
> = {
  strong: {
    label: "Strong",
    description: "Smallest files — best for sharing & email",
    quality: 0.55,
    dpi: 72,
  },
  balanced: {
    label: "Balanced",
    description: "Good size/quality tradeoff for most docs",
    quality: 0.72,
    dpi: 100,
  },
  high: {
    label: "High quality",
    description: "Crisper text & photos, larger files",
    quality: 0.85,
    dpi: 144,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode page as JPEG"));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Client-side PDF compression by re-rendering pages to JPEG and rebuilding the PDF.
 * Text becomes non-selectable (rasterized). Ideal for scans, image-heavy PDFs, and sharing.
 * Future: optional server Ghostscript path with explicit user consent.
 */
export async function compressPdfClient(options: PdfCompressOptions): Promise<PdfCompressResult> {
  const quality = clamp(options.quality, 0.4, 0.95);
  const dpi = clamp(options.dpi, 54, 200);
  const scale = dpi / 72;

  const dataCopy = options.pdfData.slice(0);
  const originalSize = dataCopy.byteLength;

  const loadingTask = getDocument({
    data: dataCopy,
    useSystemFonts: true,
    disableFontFace: false,
  });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  if (pageCount < 1) {
    throw new Error("This PDF has no pages to compress.");
  }

  const outDoc = await PDFDocument.create();
  outDoc.setProducer("SnapBit Tools — PDF Compressor");
  outDoc.setCreator("SnapBit Tools");

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const width = Math.max(1, Math.floor(viewport.width));
    const height = Math.max(1, Math.floor(viewport.height));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
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

    const jpegBytes = await canvasToJpegBytes(canvas, quality);

    // Release canvas memory early
    canvas.width = 0;
    canvas.height = 0;

    const jpgImage = await outDoc.embedJpg(jpegBytes);
    const pageWidthPt = viewport.width / scale;
    const pageHeightPt = viewport.height / scale;
    const outPage = outDoc.addPage([pageWidthPt, pageHeightPt]);
    outPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: pageWidthPt,
      height: pageHeightPt,
    });

    options.onProgress?.(pageNum, pageCount);

    // Yield so React can paint progress
    await new Promise((r) => setTimeout(r, 0));
  }

  const saved = await outDoc.save({ useObjectStreams: true });
  const outputSize = saved.byteLength;

  // Prefer original when compression did not help (common for already-optimized PDFs)
  if (outputSize >= originalSize) {
    return {
      blob: new Blob([options.pdfData.slice(0)], { type: "application/pdf" }),
      pageCount,
      outputSize: originalSize,
      usedOriginal: true,
    };
  }

  return {
    blob: new Blob([saved], { type: "application/pdf" }),
    pageCount,
    outputSize,
    usedOriginal: false,
  };
}
