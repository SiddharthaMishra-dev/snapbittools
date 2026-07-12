const CACHE_NAME = "snapbit-bg-removal-assets-v1";
const IDB_NAME = "snapbit-bg-removal-cache";
const IDB_VERSION = 2;
const IDB_STORE = "assets";

const CACHEABLE_HOST_HINTS = ["staticimgly.com", "img.ly", "background-removal-data"];

type IdbRecord = {
  url: string;
  buffer: ArrayBuffer;
  contentType: string;
  cachedAt: number;
};

function shouldCacheUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return CACHEABLE_HOST_HINTS.some(
      (hint) => parsed.hostname.includes(hint) || parsed.pathname.includes(hint),
    );
  } catch {
    return false;
  }
}

function normalizeUrl(url: string): string {
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(IDB_STORE)) {
        db.deleteObjectStore(IDB_STORE);
      }
      db.createObjectStore(IDB_STORE, { keyPath: "url" });
    };
  });
}

async function idbGet(url: string): Promise<Response | null> {
  try {
    const db = await openIdb();
    const record = await new Promise<IdbRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(url);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result as IdbRecord | undefined);
    });
    if (!record?.buffer) return null;
    return new Response(record.buffer.slice(0), {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": record.contentType || "application/octet-stream",
        "Content-Length": String(record.buffer.byteLength),
        "X-SnapBit-Cache": "HIT-IDB",
      },
    });
  } catch {
    return null;
  }
}

async function idbPut(url: string, response: Response): Promise<void> {
  try {
    const contentType = response.headers.get("Content-Type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB write aborted"));
      tx.objectStore(IDB_STORE).put({
        url,
        buffer,
        contentType,
        cachedAt: Date.now(),
      } satisfies IdbRecord);
    });
  } catch {
    // Quota / private mode — ignore.
  }
}

async function cacheApiGet(url: string): Promise<Response | null> {
  try {
    if (typeof caches === "undefined") return null;
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (!match) return null;
    const headers = new Headers(match.headers);
    headers.set("X-SnapBit-Cache", "HIT");
    return new Response(match.body, {
      status: match.status,
      statusText: match.statusText,
      headers,
    });
  } catch {
    return null;
  }
}

async function cacheApiPut(url: string, response: Response): Promise<void> {
  try {
    if (typeof caches === "undefined") return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, response);
  } catch {
    // Ignore Cache API failures (private mode, opaque responses, quota).
  }
}

export type FetchCacheResult = {
  response: Response;
  fromCache: boolean;
};

/**
 * Resolve a model/WASM URL from Cache API → IndexedDB → network.
 * Network responses are written to both stores for the next run.
 */
export async function cachedFetch(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  originalFetch: typeof fetch,
): Promise<FetchCacheResult> {
  const url = normalizeUrl(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );

  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "GET" || !shouldCacheUrl(url)) {
    return { response: await originalFetch(input, init), fromCache: false };
  }

  const fromCacheApi = await cacheApiGet(url);
  if (fromCacheApi) {
    return { response: fromCacheApi, fromCache: true };
  }

  const fromIdb = await idbGet(url);
  if (fromIdb) {
    // Warm Cache API for faster subsequent hits.
    void cacheApiPut(url, fromIdb.clone());
    return { response: fromIdb, fromCache: true };
  }

    const networkResponse = await originalFetch(input, init);
  if (networkResponse.ok) {
    const forCacheApi = networkResponse.clone();
    const forIdb = networkResponse.clone();
    // Await writes so a quick second run (or reload) cannot race past an empty cache.
    await Promise.all([cacheApiPut(url, forCacheApi), idbPut(url, forIdb)]);
  }

  return { response: networkResponse, fromCache: false };
}

let fetchCacheInstalled = false;

/**
 * Patch worker `fetch` so @imgly/background-removal asset loads hit local cache.
 * Emits `snapbit-bg-cache` CustomEvents: { url, fromCache }.
 */
export function installModelFetchCache(scope: typeof globalThis = globalThis): void {
  if (fetchCacheInstalled) return;
  fetchCacheInstalled = true;

  const originalFetch = scope.fetch.bind(scope);

  scope.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const { response, fromCache } = await cachedFetch(input, init, originalFetch);

    try {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      scope.dispatchEvent(
        new CustomEvent("snapbit-bg-cache", {
          detail: { url, fromCache, status: response.status },
        }),
      );
    } catch {
      // Workers always support events; ignore just in case.
    }

    return response;
  }) as typeof fetch;
}
