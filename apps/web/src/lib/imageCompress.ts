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
export function hasSignificantAlpha(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  const step = Math.max(4, Math.floor((width * height) / 4096) * 4);

  for (let i = 3; i < data.length; i += step) {
    if (data[i] < 250) return true;
  }

  return false;
}

/**
 * Reduce unique colors by downscaling then upscaling — effective for photographic PNGs
 * where canvas PNG re-encode alone rarely shrinks file size.
 */
function applyColorReduction(source: OffscreenCanvas, width: number, height: number, quality: number): OffscreenCanvas {
  const scale = Math.max(0.12, Math.min(1, 0.2 + quality * 0.8));
  const midWidth = Math.max(1, Math.round(width * scale));
  const midHeight = Math.max(1, Math.round(height * scale));

  const mid = new OffscreenCanvas(midWidth, midHeight);
  const midCtx = mid.getContext("2d");
  if (!midCtx) return source;

  midCtx.imageSmoothingEnabled = true;
  midCtx.drawImage(source, 0, 0, midWidth, midHeight);

  const output = new OffscreenCanvas(width, height);
  const outCtx = output.getContext("2d");
  if (!outCtx) return source;

  outCtx.imageSmoothingEnabled = true;
  outCtx.drawImage(mid, 0, 0, width, height);
  return output;
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

/** PNG-only strategies when the user wants to keep PNG output. */
async function compressPngPreserve(
  canvas: OffscreenCanvas,
  width: number,
  height: number,
  quality: number,
): Promise<EncodeCandidate> {
  const candidates: EncodeCandidate[] = [];

  candidates.push({ blob: await encodeCanvas(canvas, "image/png"), mimeType: "image/png" });

  if (quality < 0.98) {
    const reduced = applyColorReduction(canvas, width, height, quality);
    candidates.push({ blob: await encodeCanvas(reduced, "image/png"), mimeType: "image/png" });
  }

  if (quality < 0.55) {
    const aggressive = applyColorReduction(canvas, width, height, quality * 0.45);
    candidates.push({ blob: await encodeCanvas(aggressive, "image/png"), mimeType: "image/png" });
  }

  return pickSmallest(candidates);
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

  candidates.push({ blob: await encodeCanvas(canvas, "image/png"), mimeType: "image/png" });

  if (quality < 0.98) {
    const reduced = applyColorReduction(canvas, width, height, quality);
    candidates.push({ blob: await encodeCanvas(reduced, "image/png"), mimeType: "image/png" });
  }

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
