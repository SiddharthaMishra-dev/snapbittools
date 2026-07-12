import { preload, removeBackground, type Config } from "@imgly/background-removal";

import { installModelFetchCache } from "@/lib/bgRemovalModelCache";

installModelFetchCache();

export type BackgroundRemovalRequest = {
  requestId: string;
  imageData: ArrayBuffer;
  mimeType: string;
  fileName: string;
};

export type BackgroundRemovalProgress = {
  type: "progress";
  requestId: string;
  key: string;
  current: number;
  total: number;
  percent: number;
  fromCache?: boolean;
};

export type BackgroundRemovalSuccess = {
  type: "success";
  requestId: string;
  blob: Blob;
  fileName: string;
  outputSize: number;
};

export type BackgroundRemovalError = {
  type: "error";
  requestId: string;
  error: string;
};

/** Bridge so a single memoized library init can report progress for the active job. */
let activeRequestId: string | null = null;
let lastFetchWasCacheHit = true;

/**
 * Stable config (same JSON memoize key every time) so @imgly reuses the ONNX session
 * instead of reloading the model on every image.
 */
const sharedConfig: Config = {
  debug: false,
  model: "isnet_fp16",
  output: {
    format: "image/png",
    quality: 0.9,
  },
  progress: (key, current, total) => {
    if (!activeRequestId) return;

    const isFetch = key.toLowerCase().includes("fetch");
    if (isFetch && lastFetchWasCacheHit) {
      const message: BackgroundRemovalProgress = {
        type: "progress",
        requestId: activeRequestId,
        key: "compute:decode",
        current: 0,
        total: 4,
        percent: 5,
        fromCache: true,
      };
      self.postMessage(message);
      return;
    }

    const safeTotal = total > 0 ? total : 1;
    const percent = Math.min(100, Math.round((current / safeTotal) * 100));
    const message: BackgroundRemovalProgress = {
      type: "progress",
      requestId: activeRequestId,
      key,
      current,
      total,
      percent,
      fromCache: isFetch ? lastFetchWasCacheHit : undefined,
    };
    self.postMessage(message);
  },
};

self.addEventListener("snapbit-bg-cache", ((event: CustomEvent<{ fromCache: boolean }>) => {
  if (!event.detail?.fromCache) {
    lastFetchWasCacheHit = false;
  }
}) as EventListener);

/** Load + cache model as soon as the worker boots; reused for every image. */
const engineReady = preload(sharedConfig).catch((error) => {
  console.warn("[bg-removal] preload failed; will retry on first image", error);
});

self.onmessage = async (event: MessageEvent<BackgroundRemovalRequest>) => {
  const { requestId, imageData, mimeType, fileName } = event.data;

  activeRequestId = requestId;
  lastFetchWasCacheHit = true;

  try {
    await engineReady;

    const inputBlob = new Blob([imageData], { type: mimeType || "image/png" });
    const resultBlob = await removeBackground(inputBlob, sharedConfig);

    const success: BackgroundRemovalSuccess = {
      type: "success",
      requestId,
      blob: resultBlob,
      fileName,
      outputSize: resultBlob.size,
    };
    self.postMessage(success);
  } catch (error) {
    const message: BackgroundRemovalError = {
      type: "error",
      requestId,
      error: error instanceof Error ? error.message : "Background removal failed",
    };
    self.postMessage(message);
  } finally {
    if (activeRequestId === requestId) {
      activeRequestId = null;
    }
  }
};
