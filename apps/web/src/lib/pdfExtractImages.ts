import { extractEmbeddedPdfImages, MIN_EXTRACT_EDGE } from "./pdfEmbeddedImages";
import { loadPdfjs } from "./loadPdfjs";
import { pdfBaseName } from "./pdfToImagesNames";

export { pdfBaseName, MIN_EXTRACT_EDGE };

const MAX_CANVAS_EDGE = 4096;
const OBJ_WAIT_MS = 12000;

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
  data?: ArrayBufferView | string | null;
  bitmap?: ImageBitmap | ImageData | HTMLCanvasElement | OffscreenCanvas | null;
  ref?: string;
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

export function extractedImageFileName(pdfName: string, index: number, total: number, ext: "png" | "jpg" | "jp2" = "png"): string {
  const base = pdfBaseName(pdfName);
  const pad = Math.max(2, String(Math.max(total, 1)).length);
  return `${base}-photo-${String(index).padStart(pad, "0")}.${ext}`;
}

export function extractedImagesZipFileName(pdfName: string): string {
  return `${pdfBaseName(pdfName)}-photos.zip`;
}

type PdfObjectStore = {
  has: (id: string) => boolean;
  get: (id: string, callback?: (data: unknown) => void) => unknown;
};

async function resolveStoredImage(
  pageObjs: PdfObjectStore,
  commonObjs: PdfObjectStore,
  id: string,
  signal?: AbortSignal,
): Promise<PdfjsImage | null> {
  const deadline = Date.now() + OBJ_WAIT_MS;
  while (Date.now() <= deadline) {
    throwIfAborted(signal);
    if (pageObjs.has(id)) {
      const data = pageObjs.get(id);
      return isPdfjsImage(data) ? data : null;
    }
    if (commonObjs.has(id)) {
      const data = commonObjs.get(id);
      return isPdfjsImage(data) ? data : null;
    }
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  return null;
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
  } else if (img.data && typeof img.data !== "string" && ArrayBuffer.isView(img.data)) {
    const rgba = imageDataToRgba(img.data, nativeWidth, nativeHeight, img.kind, kinds);
    if (!rgba) return null;
    const pixels = new Uint8ClampedArray(new ArrayBuffer(rgba.byteLength));
    pixels.set(rgba);
    const imageData = new ImageData(pixels, nativeWidth, nativeHeight);
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
  if (img.bitmap) return true;
  return Boolean(img.data && typeof img.data === "object" && ArrayBuffer.isView(img.data));
}

function imageObjectRef(img: PdfjsImage): string | undefined {
  return typeof img.ref === "string" && img.ref.length > 0 ? img.ref : undefined;
}

function blobExtension(blob: Blob): "png" | "jpg" | "jp2" {
  if (blob.type === "image/jpeg") return "jpg";
  if (blob.type === "image/jp2") return "jp2";
  return "png";
}

type ImageCandidate = { kind: "id"; id: string } | { kind: "inline"; id: string; image: PdfjsImage };

function candidatesFromArgs(args: unknown[] | undefined, pageNumber: number, opIndex: number): ImageCandidate[] {
  if (!args?.length) return [];
  const out: ImageCandidate[] = [];

  const push = (value: unknown, suffix: string) => {
    if (typeof value === "string") {
      out.push({ kind: "id", id: value });
      return;
    }
    if (!value || typeof value !== "object") return;
    const record = value as { data?: unknown; bitmap?: unknown };
    if (typeof record.data === "string" && !record.bitmap) {
      out.push({ kind: "id", id: record.data });
      return;
    }
    if (isPdfjsImage(value)) {
      out.push({ kind: "inline", id: `inline-p${pageNumber}-${opIndex}${suffix}`, image: value });
    }
  };

  const first = args[0];
  if (Array.isArray(first)) {
    first.forEach((item, index) => push(item, `-${index}`));
    return out;
  }
  push(first, "");
  return out;
}

/**
 * Pull embedded photos out of a PDF (not a screenshot of each page).
 * Image XObjects are read from the file first — including ones inside forms,
 * patterns, and annotations — then PDF.js fills anything that walk could not decode.
 */
export async function extractPdfImages(options: ExtractPdfImagesOptions, sourceFileName = "document.pdf"): Promise<ExtractPdfImagesResult> {
  throwIfAborted(options.signal);

  let embeddedImages: ExtractedPdfImage[] = [];
  let undecodedRefs = new Set<string>();
  let pagesWithImages = new Set<number>();
  try {
    const embedded = await extractEmbeddedPdfImages(options.pdfData);
    embeddedImages = embedded.images.map((image) => ({
      id: image.id,
      pageNumber: image.pageNumber,
      blob: image.blob,
      width: image.width,
      height: image.height,
      fileName: "",
    }));
    undecodedRefs = embedded.undecodedRefs;
    pagesWithImages = embedded.pagesWithImages;
  } catch {
    embeddedImages = [];
  }

  const dataCopy = options.pdfData.slice(0);
  const pdfjs = await loadPdfjs();
  const { getDocument, OPS, ImageKind } = pdfjs;
  const imageOps = new Set([
    OPS.paintImageXObject,
    OPS.paintInlineImageXObject,
    OPS.paintImageXObjectRepeat,
    OPS.paintImageMaskXObject,
    OPS.paintImageMaskXObjectGroup,
    OPS.paintImageMaskXObjectRepeat,
  ]);

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

    const images = [...embeddedImages];
    const savedIds = new Set(images.map((image) => image.id));
    const resolveEveryPaintedImage = embeddedImages.length === 0 || undecodedRefs.size > 0;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      throwIfAborted(options.signal);

      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      const pageNeedsResolve = resolveEveryPaintedImage || !pagesWithImages.has(pageNum);
      const pending: ImageCandidate[] = [];

      for (let i = 0; i < ops.fnArray.length; i++) {
        if (!imageOps.has(ops.fnArray[i])) continue;
        pending.push(...candidatesFromArgs(ops.argsArray[i], pageNum, i));
      }

      const resolved = await Promise.all(
        pending.map(async (candidate) => {
          if (candidate.kind === "inline") return candidate;
          if (!pageNeedsResolve || savedIds.has(candidate.id)) return null;
          const image = await resolveStoredImage(page.objs, page.commonObjs, candidate.id, options.signal);
          return image ? { ...candidate, image } : null;
        }),
      );

      for (const candidate of resolved) {
        if (!candidate || !("image" in candidate) || !candidate.image) continue;
        const ref = imageObjectRef(candidate.image);
        const objectId = ref ?? candidate.id;
        if (savedIds.has(objectId)) continue;
        if (ref && savedIds.has(ref) && !undecodedRefs.has(ref)) continue;

        const png = await pdfImageToPng(candidate.image, ImageKind);
        if (!png) continue;

        savedIds.add(objectId);
        if (ref) savedIds.add(ref);
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
      fileName: extractedImageFileName(sourceFileName, index + 1, images.length, blobExtension(image.blob)),
    }));

    return { images: named, pageCount };
  } catch (err) {
    throw friendlyPdfError(err);
  }
}
