import { pdfBaseName } from "./pdfToImagesNames";
import { loadPdfjs } from "./loadPdfjs";

export { pdfBaseName };

export const MIN_EXTRACT_EDGE = 16;
const MAX_CANVAS_EDGE = 4096;
const OBJ_WAIT_MS = 500;

export type ExtractedPdfImage = {
  id: string;
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
};

export type ExtractPdfImagesOptions = {
  pdfData: ArrayBuffer;
  signal?: AbortSignal;
  onProgress?: (currentPage: number, totalPages: number) => void;
};

export type ExtractPdfImagesResult = {
  images: ExtractedPdfImage[];
  pageCount: number;
};

type PdfjsImage = {
  width?: number;
  height?: number;
  kind?: number;
  data?: ArrayBufferView | null;
  bitmap?: ImageBitmap | ImageData | HTMLCanvasElement | OffscreenCanvas | null;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Extraction cancelled", "AbortError");
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

  return err instanceof Error ? err : new Error("Failed to extract images. The PDF may be encrypted or corrupted.");
}

export function extractedImageFileName(pdfName: string, index: number, total: number): string {
  const base = pdfBaseName(pdfName);
  const pad = Math.max(2, String(Math.max(total, 1)).length);
  return `${base}-photo-${String(index).padStart(pad, "0")}.png`;
}

export function extractedImagesZipFileName(pdfName: string): string {
  return `${pdfBaseName(pdfName)}-photos.zip`;
}

function waitForObj(objs: { get: (id: string, callback?: (data: unknown) => void) => unknown }, id: string): Promise<unknown> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), OBJ_WAIT_MS);
    try {
      objs.get(id, (data: unknown) => {
        window.clearTimeout(timer);
        resolve(data ?? null);
      });
    } catch {
      window.clearTimeout(timer);
      resolve(null);
    }
  });
}

function toUint8(data: ArrayBufferView): Uint8Array {
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

export function imageDataToRgba(
  data: ArrayBufferView,
  width: number,
  height: number,
  kind: number | undefined,
  kinds: { GRAYSCALE_1BPP: number; RGB_24BPP: number; RGBA_32BPP: number },
): Uint8ClampedArray | null {
  const src = toUint8(data);
  const pixels = width * height;
  if (pixels < 1) return null;

  if (kind === kinds.RGBA_32BPP || src.length === pixels * 4) {
    return src.length >= pixels * 4 ? new Uint8ClampedArray(src.subarray(0, pixels * 4)) : null;
  }

  if (kind === kinds.RGB_24BPP || src.length === pixels * 3) {
    if (src.length < pixels * 3) return null;
    const rgba = new Uint8ClampedArray(pixels * 4);
    for (let i = 0, j = 0; i < pixels * 3; i += 3, j += 4) {
      rgba[j] = src[i];
      rgba[j + 1] = src[i + 1];
      rgba[j + 2] = src[i + 2];
      rgba[j + 3] = 255;
    }
    return rgba;
  }

  if (kind === kinds.GRAYSCALE_1BPP) {
    const rowBytes = (width + 7) >> 3;
    if (src.length < rowBytes * height) return null;
    const rgba = new Uint8ClampedArray(pixels * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const byte = src[y * rowBytes + (x >> 3)];
        const bit = (byte >> (7 - (x & 7))) & 1;
        const v = bit ? 0 : 255;
        const j = (y * width + x) * 4;
        rgba[j] = v;
        rgba[j + 1] = v;
        rgba[j + 2] = v;
        rgba[j + 3] = 255;
      }
    }
    return rgba;
  }

  if (src.length === pixels) {
    const rgba = new Uint8ClampedArray(pixels * 4);
    for (let i = 0, j = 0; i < pixels; i++, j += 4) {
      const v = src[i];
      rgba[j] = v;
      rgba[j + 1] = v;
      rgba[j + 2] = v;
      rgba[j + 3] = 255;
    }
    return rgba;
  }

  return null;
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode an extracted photo as PNG"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

async function pdfImageToPng(
  img: PdfjsImage,
  kinds: { GRAYSCALE_1BPP: number; RGB_24BPP: number; RGBA_32BPP: number },
): Promise<{
  blob: Blob;
  width: number;
  height: number;
} | null> {
  const bitmap = img.bitmap;
  const nativeWidth = Math.max(1, Math.floor(img.width || (bitmap && "width" in bitmap ? Number(bitmap.width) : 0) || 0));
  const nativeHeight = Math.max(1, Math.floor(img.height || (bitmap && "height" in bitmap ? Number(bitmap.height) : 0) || 0));

  if (nativeWidth < MIN_EXTRACT_EDGE || nativeHeight < MIN_EXTRACT_EDGE) {
    return null;
  }

  const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(nativeWidth, nativeHeight));
  const width = Math.max(1, Math.floor(nativeWidth * scale));
  const height = Math.max(1, Math.floor(nativeHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }

  if (bitmap instanceof ImageBitmap || bitmap instanceof HTMLImageElement || bitmap instanceof HTMLCanvasElement) {
    ctx.drawImage(bitmap, 0, 0, width, height);
  } else if (typeof OffscreenCanvas !== "undefined" && bitmap instanceof OffscreenCanvas) {
    ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0, width, height);
  } else if (bitmap instanceof ImageData) {
    const tmp = document.createElement("canvas");
    tmp.width = bitmap.width;
    tmp.height = bitmap.height;
    const tmpCtx = tmp.getContext("2d");
    if (!tmpCtx) return null;
    tmpCtx.putImageData(bitmap, 0, 0);
    ctx.drawImage(tmp, 0, 0, width, height);
  } else if (img.data) {
    const rgba = imageDataToRgba(img.data, nativeWidth, nativeHeight, img.kind, kinds);
    if (!rgba) return null;
    const imageData = new ImageData(rgba, nativeWidth, nativeHeight);
    if (width === nativeWidth && height === nativeHeight) {
      ctx.putImageData(imageData, 0, 0);
    } else {
      const tmp = document.createElement("canvas");
      tmp.width = nativeWidth;
      tmp.height = nativeHeight;
      const tmpCtx = tmp.getContext("2d");
      if (!tmpCtx) return null;
      tmpCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tmp, 0, 0, width, height);
    }
  } else {
    return null;
  }

  const blob = await canvasToPng(canvas);
  canvas.width = 0;
  canvas.height = 0;
  return { blob, width, height };
}

function isPdfjsImage(value: unknown): value is PdfjsImage {
  if (!value || typeof value !== "object") return false;
  const img = value as PdfjsImage;
  return Boolean(img.bitmap || img.data);
}

/**
 * Pull embedded image XObjects out of a PDF (not a screenshot of each page).
 */
export async function extractPdfImages(options: ExtractPdfImagesOptions, sourceFileName = "document.pdf"): Promise<ExtractPdfImagesResult> {
  throwIfAborted(options.signal);

  const dataCopy = options.pdfData.slice(0);
  const pdfjs = await loadPdfjs();
  const { getDocument, OPS, ImageKind } = pdfjs;
  const imageOps = new Set([OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.paintImageXObjectRepeat]);

  try {
    const loadingTask = getDocument({
      data: dataCopy,
      useSystemFonts: true,
      disableFontFace: false,
    });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    if (pageCount < 1) {
      throw new Error("This PDF has no pages to scan.");
    }

    const seen = new Set<string>();
    const images: ExtractedPdfImage[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      throwIfAborted(options.signal);

      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();

      for (let i = 0; i < ops.fnArray.length; i++) {
        throwIfAborted(options.signal);
        if (!imageOps.has(ops.fnArray[i])) continue;

        const arg = ops.argsArray[i]?.[0];
        let img: PdfjsImage | null = null;
        let objectId: string;

        if (typeof arg === "string") {
          objectId = arg;
          if (seen.has(objectId)) continue;
          const resolved = (await waitForObj(page.objs, arg)) ?? (await waitForObj(page.commonObjs, arg));
          if (!isPdfjsImage(resolved)) continue;
          img = resolved;
        } else if (isPdfjsImage(arg)) {
          objectId = `inline-p${pageNum}-${i}`;
          if (seen.has(objectId)) continue;
          img = arg;
        } else {
          continue;
        }

        const png = await pdfImageToPng(img, ImageKind);
        if (!png) continue;

        seen.add(objectId);
        images.push({
          id: objectId,
          pageNumber: pageNum,
          blob: png.blob,
          width: png.width,
          height: png.height,
          fileName: "",
        });
      }

      options.onProgress?.(pageNum, pageCount);
      await new Promise((r) => setTimeout(r, 0));
    }

    const named = images.map((image, index) => ({
      ...image,
      fileName: extractedImageFileName(sourceFileName, index + 1, images.length),
    }));

    return { images: named, pageCount };
  } catch (err) {
    throw friendlyPdfError(err);
  }
}
