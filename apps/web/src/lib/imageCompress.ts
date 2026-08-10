import UPNG from "upng-js";

export type CompressResult = {
  blob: Blob;
  mimeType: string;
};

type EncodeCandidate = {
  blob: Blob;
  mimeType: string;
};

function resizeDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function drawImageToCanvas(
  image: ImageBitmap,
  width: number,
  height: number,
  transparentBackground: boolean,
): OffscreenCanvas {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  if (transparentBackground) {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

/** Sample pixels to detect meaningful alpha (transparency). */
export function hasSignificantAlpha(
  ctx: OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  const step = Math.max(4, Math.floor((width * height) / 4096) * 4);

  for (let i = 3; i < data.length; i += step) {
    if (data[i] < 250) return true;
  }

  return false;
}

/**
 * Map quality slider (0–1) to UPNG palette size.
 * 0 = lossless (all colors). Lower quality → fewer colors → smaller files.
 */
export function qualityToPngColors(quality: number): number {
  if (quality >= 0.98) return 0;
  if (quality >= 0.85) return 256;
  if (quality >= 0.7) return 192;
  if (quality >= 0.55) return 128;
  if (quality >= 0.4) return 64;
  if (quality >= 0.25) return 32;
  return 16;
}

/** Encode canvas pixels to PNG with UPNG (quantized palette when cnum > 0). */
export function encodePngWithUpng(
  canvas: OffscreenCanvas,
  width: number,
  height: number,
  maxColors: number,
): Blob {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context for PNG encoding");
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = imageData.data.buffer.slice(
    imageData.data.byteOffset,
    imageData.data.byteOffset + imageData.data.byteLength,
  );

  const pngBuffer = UPNG.encode([rgba], width, height, maxColors);
  return new Blob([pngBuffer], { type: "image/png" });
}

async function encodeCanvas(canvas: OffscreenCanvas, mimeType: string, quality?: number): Promise<Blob> {
  return canvas.convertToBlob({
    type: mimeType,
    ...(quality !== undefined ? { quality } : {}),
  });
}

async function pickSmallest(candidates: EncodeCandidate[]): Promise<EncodeCandidate> {
  let best = candidates[0];
  for (const candidate of candidates.slice(1)) {
    if (candidate.blob.size < best.blob.size) {
      best = candidate;
    }
  }
  return best;
}

/** PNG compression via upng-js when preserving PNG format. */
async function compressPngPreserve(
  canvas: OffscreenCanvas,
  width: number,
  height: number,
  quality: number,
): Promise<EncodeCandidate> {
  const maxColors = qualityToPngColors(quality);

  // High quality / lossless: never quantize — picking a smaller paletted PNG
  // would destroy photographic detail even at 100% quality.
  if (maxColors === 0) {
    const upngLossless = encodePngWithUpng(canvas, width, height, 0);
    const canvasPng = await encodeCanvas(canvas, "image/png");
    return pickSmallest([
      { blob: upngLossless, mimeType: "image/png" },
      { blob: canvasPng, mimeType: "image/png" },
    ]);
  }

  // Lossy: encode exactly at the requested palette size (no lower-quality trial).
  return {
    blob: encodePngWithUpng(canvas, width, height, maxColors),
    mimeType: "image/png",
  };
}

async function compressWithConversion(
  canvas: OffscreenCanvas,
  width: number,
  height: number,
  quality: number,
): Promise<EncodeCandidate> {
  const ctx = canvas.getContext("2d");
  const hasAlpha = ctx ? hasSignificantAlpha(ctx, width, height) : false;
  const candidates: EncodeCandidate[] = [];

  candidates.push({ blob: await encodeCanvas(canvas, "image/webp", quality), mimeType: "image/webp" });

  if (!hasAlpha) {
    candidates.push({ blob: await encodeCanvas(canvas, "image/jpeg", quality), mimeType: "image/jpeg" });
  }

  // UPNG PNG as another candidate (often wins for graphics / transparency).
  // Keep cnum=0 for lossless — do not coerce to 256.
  const maxColors = qualityToPngColors(quality);
  candidates.push({
    blob: encodePngWithUpng(canvas, width, height, maxColors),
    mimeType: "image/png",
  });

  return pickSmallest(candidates);
}

export async function compressImageBuffer(options: {
  imageData: ArrayBuffer;
  mimeType: string;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  originalSize: number;
  preserveFormat: boolean;
}): Promise<CompressResult> {
  const { imageData, mimeType, quality, maxWidth, maxHeight, originalSize, preserveFormat } = options;

  const blob = new Blob([imageData]);
  const imageBitmap = await createImageBitmap(blob);
  const originalWidth = imageBitmap.width;
  const originalHeight = imageBitmap.height;

  const { width, height } = resizeDimensions(originalWidth, originalHeight, maxWidth, maxHeight);
  const isPng = mimeType === "image/png";
  const transparentBg = isPng && preserveFormat;

  const canvas = drawImageToCanvas(imageBitmap, width, height, transparentBg);
  imageBitmap.close();

  let result: EncodeCandidate;

  if (preserveFormat && isPng) {
    result = await compressPngPreserve(canvas, width, height, quality);
  } else if (preserveFormat) {
    const outputQuality = mimeType === "image/jpeg" || mimeType === "image/webp" ? quality : undefined;
    result = {
      blob: await encodeCanvas(canvas, mimeType, outputQuality),
      mimeType,
    };
  } else {
    result = await compressWithConversion(canvas, width, height, quality);
  }

  const dimensionsChanged = width !== originalWidth || height !== originalHeight;
  const useCompressed = result.blob.size < originalSize || dimensionsChanged;

  if (!useCompressed) {
    return { blob: new Blob([imageData]), mimeType };
  }

  return { blob: result.blob, mimeType: result.mimeType };
}

export function mimeTypeToExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    default:
      return "jpg";
  }
}
