/// <reference lib="webworker" />

/**
 * Runs the Mirage vision model on the Cactus WebAssembly engine.
 *
 * The engine (vendored, same origin) and the Mirage weights (Hugging Face, pinned revision,
 * SHA-256 checked, kept in the Cache API) load once per worker. Images are decoded here,
 * converted to packed RGB, and passed to `cactus_describe`. Pixels never leave the device.
 */

import createCactus, { type CactusModule } from "@/vendor/cactus/cactus.mjs";
import cactusWasmUrl from "@/vendor/cactus/cactus.wasm?url";

import { CACTUS_VISION, MIRAGE_WEIGHTS, fitWithin, rgbaToRgb, type MirageOptions, type MirageResult } from "@/lib/mirage";

declare const self: DedicatedWorkerGlobalScope;

const WEIGHTS_CACHE = "snapbit-mirage-v1";
const OUTPUT_CAPACITY = 16 * 1024 * 1024;

export type MirageWorkerRequest =
  | { type: "prepare"; requestId: string }
  | { type: "describe"; requestId: string; image: Blob; options: MirageOptions; language?: string };

export type MirageWorkerProgress = {
  type: "progress";
  requestId: string;
  phase: "download" | "load" | "decode" | "analyze";
  /** 0–1 for downloads; undefined while a step has no measurable progress. */
  fraction?: number;
  fromCache?: boolean;
};

export type MirageWorkerReady = { type: "ready"; requestId: string; fromCache: boolean };

export type MirageWorkerResult = {
  type: "result";
  requestId: string;
  result: MirageResult;
  width: number;
  height: number;
  scaled: boolean;
  elapsedMs: number;
};

export type MirageWorkerError = { type: "error"; requestId: string; error: string };

export type MirageWorkerResponse = MirageWorkerProgress | MirageWorkerReady | MirageWorkerResult | MirageWorkerError;

type Engine = { module: CactusModule; output: number; fromCache: boolean };

let enginePromise: Promise<Engine> | null = null;
/** Requests waiting on the shared engine load, so every caller sees its progress. */
const loadListeners = new Set<string>();

function post(message: MirageWorkerResponse) {
  self.postMessage(message);
}

function broadcast(message: Omit<MirageWorkerProgress, "requestId" | "type">) {
  for (const requestId of loadListeners) post({ type: "progress", requestId, ...message });
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function openCache(): Promise<Cache | null> {
  try {
    return typeof caches === "undefined" ? null : await caches.open(WEIGHTS_CACHE);
  } catch {
    return null; // Private mode or blocked storage: download every time.
  }
}

async function downloadWeights(): Promise<ArrayBuffer> {
  const response = await fetch(MIRAGE_WEIGHTS.url);
  if (!response.ok || !response.body) throw new Error(`Could not download the Mirage model (HTTP ${response.status}).`);

  const total = Number(response.headers.get("Content-Length")) || MIRAGE_WEIGHTS.size;
  const bytes = new Uint8Array(total);
  const reader = response.body.getReader();
  let received = 0;
  let lastReported = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (received + value.length > bytes.length) throw new Error("The Mirage model download was larger than expected.");
    bytes.set(value, received);
    received += value.length;
    if (received - lastReported > 256 * 1024) {
      lastReported = received;
      broadcast({ phase: "download", fraction: received / total });
    }
  }
  broadcast({ phase: "download", fraction: 1 });
  return bytes.buffer.slice(0, received);
}

async function loadWeights(): Promise<{ buffer: ArrayBuffer; fromCache: boolean }> {
  const cache = await openCache();
  const cached = await cache?.match(MIRAGE_WEIGHTS.url).catch(() => undefined);
  if (cached) {
    const buffer = await cached.arrayBuffer();
    if ((await sha256Hex(buffer)) === MIRAGE_WEIGHTS.sha256) return { buffer, fromCache: true };
    await cache?.delete(MIRAGE_WEIGHTS.url).catch(() => {});
  }

  broadcast({ phase: "download", fraction: 0 });
  const buffer = await downloadWeights();
  if ((await sha256Hex(buffer)) !== MIRAGE_WEIGHTS.sha256) {
    throw new Error("The downloaded Mirage model failed its integrity check. Please try again.");
  }
  await cache
    ?.put(MIRAGE_WEIGHTS.url, new Response(buffer.slice(0), { headers: { "Content-Type": "application/octet-stream" } }))
    .catch(() => {}); // Quota exceeded: still usable for this session.
  return { buffer, fromCache: false };
}

function lastError(module: CactusModule): string {
  const ptr = module._cactus_last_error();
  return (ptr && module.UTF8ToString(ptr)) || "Mirage failed without an error message.";
}

/** Copies bytes into WASM memory. The caller frees the pointer. */
function copyIn(module: CactusModule, bytes: Uint8Array): number {
  const ptr = module._malloc(bytes.length);
  if (!ptr) throw new Error("Not enough memory to run Mirage on this image. Try a smaller image.");
  module.HEAPU8.set(bytes, ptr);
  return ptr;
}

function copyInString(module: CactusModule, value: string): number {
  const encoded = new TextEncoder().encode(value);
  const withNul = new Uint8Array(encoded.length + 1);
  withNul.set(encoded);
  return copyIn(module, withNul);
}

async function loadEngineModule(): Promise<CactusModule> {
  // The loader resolves cactus.wasm next to the worker script and ignores `locateFile`,
  // so fetch the bundled asset here and hand over the bytes.
  const response = await fetch(cactusWasmUrl);
  if (!response.ok) throw new Error(`Could not load the Cactus engine (HTTP ${response.status}).`);
  return createCactus({ wasmBinary: await response.arrayBuffer() });
}

async function createEngine(): Promise<Engine> {
  const [module, weights] = await Promise.all([loadEngineModule(), loadWeights()]);
  broadcast({ phase: "load", fromCache: weights.fromCache });

  const weightsPtr = copyIn(module, new Uint8Array(weights.buffer));
  try {
    if (module._cactus_load(weightsPtr, BigInt(weights.buffer.byteLength)) < 0) throw new Error(lastError(module));
  } finally {
    module._free(weightsPtr);
  }
  if (!(module._cactus_models() & CACTUS_VISION)) throw new Error("The downloaded file is not a Mirage vision model.");

  const output = module._malloc(OUTPUT_CAPACITY);
  if (!output) throw new Error("Not enough memory to start Mirage.");
  return { module, output, fromCache: weights.fromCache };
}

async function getEngine(requestId: string): Promise<Engine> {
  loadListeners.add(requestId);
  try {
    enginePromise ??= createEngine().catch((error) => {
      enginePromise = null; // Let the next request retry, e.g. after a network error.
      throw error;
    });
    return await enginePromise;
  } finally {
    loadListeners.delete(requestId);
  }
}

async function decode(image: Blob): Promise<{ rgb: Uint8Array; width: number; height: number; scaled: boolean }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(image, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image could not be decoded. Try a JPG, PNG, or WebP file.");
  }
  const size = fitWithin(bitmap.width, bitmap.height);
  const scaled = size.width !== bitmap.width || size.height !== bitmap.height;

  const canvas = new OffscreenCanvas(size.width, size.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser cannot read image pixels in a worker.");
  // Transparent areas read as black otherwise, which hides dark text on transparent PNGs.
  context.fillStyle = "#fff";
  context.fillRect(0, 0, size.width, size.height);
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();

  const { data } = context.getImageData(0, 0, size.width, size.height);
  return { rgb: rgbaToRgb(data), ...size, scaled };
}

async function describe(request: Extract<MirageWorkerRequest, { type: "describe" }>) {
  const { requestId } = request;
  const engine = await getEngine(requestId);
  const { module, output } = engine;

  post({ type: "progress", requestId, phase: "decode" });
  const image = await decode(request.image);

  post({ type: "progress", requestId, phase: "analyze" });
  const started = performance.now();
  const pointers: number[] = [];
  try {
    const rgb = copyIn(module, image.rgb);
    pointers.push(rgb);
    const options = copyInString(module, JSON.stringify(request.options));
    pointers.push(options);
    const language = request.language ? copyInString(module, request.language) : 0;
    if (language) pointers.push(language);

    const code = module._cactus_describe(rgb, image.width, image.height, options, language, 0, output, OUTPUT_CAPACITY);
    if (code < 0) throw new Error(lastError(module));

    const result = JSON.parse(module.UTF8ToString(output)) as MirageResult;
    post({
      type: "result",
      requestId,
      result,
      width: image.width,
      height: image.height,
      scaled: image.scaled,
      elapsedMs: Math.round(performance.now() - started),
    });
  } finally {
    for (const ptr of pointers) module._free(ptr);
  }
}

// Requests run one at a time: the engine keeps per-call state in one WASM instance.
let queue: Promise<void> = Promise.resolve();

self.onmessage = (event: MessageEvent<MirageWorkerRequest>) => {
  const request = event.data;
  queue = queue.then(async () => {
    try {
      if (request.type === "prepare") {
        const engine = await getEngine(request.requestId);
        post({ type: "ready", requestId: request.requestId, fromCache: engine.fromCache });
      } else {
        await describe(request);
      }
    } catch (error) {
      // A trap (for example out of memory) leaves the WASM instance unusable. Start fresh next time.
      if (error instanceof WebAssembly.RuntimeError) enginePromise = null;
      post({ type: "error", requestId: request.requestId, error: error instanceof Error ? error.message : String(error) });
    }
  });
};
